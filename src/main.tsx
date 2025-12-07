import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'\nimport { AuthProvider } from './contexts/AuthContext.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(\n  <StrictMode>\n    <AuthProvider>
        <App />\n    </AuthProvider>\n  </StrictMode>,
)
