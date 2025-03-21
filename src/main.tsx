// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import './shared/styles/tooltip.css'
import { router } from './app/router'
import { I18nProvider } from './app/providers/i18n-provider'
import { ErrorBoundary } from './shared/ui/error-boundary'

// Initialize i18n and render the app
const initializeApp = () => {
  const root = createRoot(document.getElementById('root')!);
  
  root.render(
    <>
      <ErrorBoundary>
        <I18nProvider>
          <RouterProvider router={router} />
        </I18nProvider>
      </ErrorBoundary>
    </>
  );
};

// Start the application
initializeApp();
