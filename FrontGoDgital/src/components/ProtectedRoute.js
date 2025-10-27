import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import PropTypes from "prop-types"

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
}
