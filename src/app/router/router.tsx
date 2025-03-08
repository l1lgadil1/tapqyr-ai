import { createBrowserRouter } from 'react-router-dom';
import { TodoPage } from '../../pages/todo-page';
import { LandingPage } from '../../pages/landing-page';
import App from '../../App';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <LandingPage />
      },
      {
        path: 'todo',
        element: <TodoPage />
      }
    ]
  }
]); 