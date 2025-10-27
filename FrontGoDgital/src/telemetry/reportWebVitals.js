const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api"
const WEB_VITALS_ENDPOINT = process.env.REACT_APP_WEB_VITALS_ENDPOINT || `${API_BASE_URL}/status/web-vitals`

function sendMetric(metric) {
  const payload = {
    id: metric.id,
    name: metric.name,
    value: Number(metric.value || 0),
    delta: Number(metric.delta || 0),
    rating: metric.rating,
    navigationType: metric.navigationType,
    page: window.location.pathname,
    timestamp: Date.now(),
    attribution: metric.attribution || {},
  }

  try {
    const body = JSON.stringify(payload)
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" })
      navigator.sendBeacon(WEB_VITALS_ENDPOINT, blob)
    } else {
      fetch(WEB_VITALS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch((error) => {
        if (process.env.NODE_ENV === "development") {
          console.debug("Falha ao enviar métricas", error)
        }
      })
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.debug("Erro ao serializar métricas", error)
    }
  }
}

function observe(entryType, callback) {
  if (PerformanceObserver.supportedEntryTypes?.includes(entryType)) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        callback(entry)
      }
    })
    observer.observe({ type: entryType, buffered: true })
  }
}

function reportCLS() {
  let clsValue = 0
  observe("layout-shift", (entry) => {
    if (!entry.hadRecentInput) {
      clsValue += entry.value
      sendMetric({
        id: entry.id,
        name: "CLS",
        value: clsValue,
        delta: entry.value,
        rating: clsValue < 0.1 ? "good" : clsValue < 0.25 ? "needs-improvement" : "poor",
        navigationType: performance.getEntriesByType("navigation")[0]?.type,
        attribution: { sources: entry.sources?.length },
      })
    }
  })
}

function reportFID() {
  observe("first-input", (entry) => {
    const delay = entry.processingStart - entry.startTime
    sendMetric({
      id: entry.id,
      name: "FID",
      value: delay,
      delta: delay,
      rating: delay <= 100 ? "good" : delay <= 300 ? "needs-improvement" : "poor",
      navigationType: performance.getEntriesByType("navigation")[0]?.type,
      attribution: { type: entry.name },
    })
  })
}

function reportLCP() {
  observe("largest-contentful-paint", (entry) => {
    sendMetric({
      id: entry.id,
      name: "LCP",
      value: entry.startTime,
      delta: entry.startTime,
      rating: entry.startTime <= 2500 ? "good" : entry.startTime <= 4000 ? "needs-improvement" : "poor",
      navigationType: performance.getEntriesByType("navigation")[0]?.type,
      attribution: { size: entry.size },
    })
  })
}

function reportFCP() {
  const entry = performance.getEntriesByName("first-contentful-paint")[0]
  if (entry) {
    sendMetric({
      id: entry.id || "fcp",
      name: "FCP",
      value: entry.startTime,
      delta: entry.startTime,
      rating: entry.startTime <= 1800 ? "good" : entry.startTime <= 3000 ? "needs-improvement" : "poor",
      navigationType: performance.getEntriesByType("navigation")[0]?.type,
      attribution: {},
    })
  }
}

function reportTTFB() {
  const navigationEntry = performance.getEntriesByType("navigation")[0]
  if (navigationEntry) {
    const ttfb = navigationEntry.responseStart
    sendMetric({
      id: navigationEntry.name,
      name: "TTFB",
      value: ttfb,
      delta: ttfb,
      rating: ttfb <= 800 ? "good" : ttfb <= 1800 ? "needs-improvement" : "poor",
      navigationType: navigationEntry.type,
      attribution: {},
    })
  }
}

function reportINP() {
  observe("event", (entry) => {
    if (entry.name === "click" || entry.name === "keydown" || entry.name === "pointerdown") {
      const value = entry.duration
      sendMetric({
        id: entry.name,
        name: "INP",
        value,
        delta: value,
        rating: value <= 200 ? "good" : value <= 500 ? "needs-improvement" : "poor",
        navigationType: performance.getEntriesByType("navigation")[0]?.type,
        attribution: { event: entry.name },
      })
    }
  })
}

export function startWebVitalsTracking() {
  if (typeof PerformanceObserver === "undefined") {
    return
  }
  reportCLS()
  reportFID()
  reportLCP()
  reportFCP()
  reportTTFB()
  reportINP()
}
