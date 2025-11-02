import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

// Initialize Firebase early
if (typeof window !== 'undefined') {
  // This ensures Firebase is available when components need it
  console.log('Initializing Firebase environment...')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
