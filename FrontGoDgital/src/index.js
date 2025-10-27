import React from "react"
import ReactDOM from "react-dom/client"
import 'bootstrap/dist/css/bootstrap.min.css'
import App from "./App"
import { startWebVitalsTracking } from "./telemetry/reportWebVitals"

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

startWebVitalsTracking()
