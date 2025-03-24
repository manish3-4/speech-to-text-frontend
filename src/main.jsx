import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'

import App from './App.jsx'
import { LoadingProvider } from './lib/LoadingContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LoadingProvider>
        <App />
        </LoadingProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
