import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import './index.css'

// Register Service Worker for PWA support
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
        <StrictMode>
                <ErrorBoundary>
                        <AuthProvider>
                                <App />
                        </AuthProvider>
                </ErrorBoundary>
        </StrictMode>,
)
