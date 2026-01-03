import { createBrowserRouter } from 'react-router-dom';
import App from './App';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        lazy: () => import('./pages/HomePage'),
      },
      {
        path: 'login',
        lazy: () => import('./pages/LoginPage'),
      },
      {
        path: 'register',
        lazy: () => import('./pages/RegisterPage'),
      },
      {
        path: 'workout',
        lazy: () => import('./pages/WorkoutPage'),
      },
      {
        path: 'statistics',
        lazy: () => import('./pages/StatisticsPage'),
      },
      {
        path: 'profile',
        lazy: () => import('./pages/ProfilePage'),
      },
    ],
  },
]);
