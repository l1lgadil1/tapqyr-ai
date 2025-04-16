import { createBrowserRouter } from 'react-router-dom';
import { DashboardPage } from '../../pages/dashboard-page';
import { LandingPage } from '../../pages/landing-page';
import { LoginPage, RegisterPage, ForgotPasswordPage } from '../../pages/auth';
import DebugPage from '../../pages/debug-page';
import App from '../../App';
import { ErrorElement } from '../../shared/ui/error-element';
import { TasksPage } from '../../pages/todo-page';
import { AnalyticsPage } from '../../pages/analytics-page/ui/analytics-page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorElement />,
    children: [
      {
        index: true,
        element: <LandingPage />
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
        errorElement: <ErrorElement />
      },
      {
        path: 'todo',
        element: <TasksPage />,
        errorElement: <ErrorElement />
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
        errorElement: <ErrorElement />
      },
      {
        path: 'debug',
        element: <DebugPage />,
        errorElement: <ErrorElement />
      },
      {
        path: 'auth',
        children: [
          {
            path: 'login',
            element: <LoginPage />
          },
          {
            path: 'register',
            element: <RegisterPage />
          },
          {
            path: 'forgot-password',
            element: <ForgotPasswordPage />
          }
        ]
      }
    ]
  }
]); 