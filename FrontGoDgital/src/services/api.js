import axios from "axios"

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api"
const AUTH_REFRESH_ENDPOINT = `${API_BASE_URL}/auth/refresh`

let refreshPromise = null

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken")
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  if (!config.headers["X-Request-ID"]) {
    const generator = window.crypto?.randomUUID?.bind(window.crypto)
    const requestId = generator ? generator() : `${Date.now()}-${Math.random()}`
    config.headers["X-Request-ID"] = requestId
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error

    if (!response || !config || config._retry) {
      return Promise.reject(error)
    }

    if (response.status === 401) {
      config._retry = true

      try {
        refreshPromise = refreshPromise ?? refreshAccessToken()
        const newAccessToken = await refreshPromise
        refreshPromise = null

        if (newAccessToken) {
          config.headers.Authorization = `Bearer ${newAccessToken}`
          return api(config)
        }
      } catch (refreshError) {
        refreshPromise = null
        handleUnauthorized()
        return Promise.reject(refreshError)
      }
    }

    if (response.status === 403) {
      console.warn("Forbidden request", { url: config.url })
    }

    return Promise.reject(error)
  }
)

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken")

  if (!refreshToken) {
    handleUnauthorized()
    return null
  }

  const refreshResponse = await axios.post(
    AUTH_REFRESH_ENDPOINT,
    { refreshToken },
    { timeout: 15000 }
  )

  const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data

  if (accessToken && newRefreshToken) {
    localStorage.setItem("accessToken", accessToken)
    localStorage.setItem("refreshToken", newRefreshToken)
    return accessToken
  }

  handleUnauthorized()
  return null
}

function handleUnauthorized() {
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("user")
  if (window.location.pathname !== "/login") {
    window.location.href = "/login"
  }
}

export default api
