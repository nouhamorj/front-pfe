// src/app/router/router.jsx
import { createBrowserRouter } from 'react-router';
import Root from 'app/layouts/Root';
import RootErrorBoundary from 'app/pages/errors/RootErrorBoundary';
import { SplashScreen } from 'components/template/SplashScreen';
import { protectedRoutes } from './protected';
import { ghostRoutes } from './ghost';
import { publicRoutes } from './public';

const router = createBrowserRouter([
  {
    id: 'root',
    Component: Root,
    hydrateFallbackElement: <SplashScreen />,
    ErrorBoundary: RootErrorBoundary,
    children: [
      protectedRoutes,
      ghostRoutes,
      publicRoutes,
      {
        path: '/unauthorized',
        lazy: async () => ({
          Component: (await import('app/pages/errors/Unauthorized')).default,
        }),
      },
    ],
  },
]);

export default router;