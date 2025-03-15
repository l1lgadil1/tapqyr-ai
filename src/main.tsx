import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import './shared/styles/tooltip.css'
import { router } from './app/router'
// Import i18n configuration
import './shared/lib/i18n/i18n'
import { ErrorBoundary } from './shared/ui/error-boundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)
