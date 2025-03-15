import { createBrowserRouter } from 'react-router-dom';
import { TodoPage } from '../../pages/todo-page';
import { LandingPage } from '../../pages/landing-page';
import App from '../../App';
import { ErrorElement } from '../../shared/ui/error-element';

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
        path: 'todo',
        element: <TodoPage />,
        errorElement: <ErrorElement />
      }
    ]
  }
]); 