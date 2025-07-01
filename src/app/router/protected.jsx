// src/app/router/protected.jsx
import { Navigate } from 'react-router';
import { AppLayout } from 'app/layouts/AppLayout';
import { DynamicLayout } from 'app/layouts/DynamicLayout';
import AuthGuard from 'middleware/AuthGuard';

const protectedRoutes = {
  id: 'protected',
  Component: AuthGuard, // Protège toutes les routes avec AuthGuard sans rôles spécifiques
  children: [
    {
      Component: DynamicLayout,
      children: [
        {
          index: true,
          element: <Navigate to="/dashboards/home" replace />,
        },
        {
          path: 'dashboards',
          children: [
            {
              index: true,
              element: <Navigate to="/dashboards/home" replace />,
            },
            {
              path: 'home',
              lazy: async () => ({
                Component: (await import('app/pages/dashboards/home/HomeRouter')).default,
              }),
            },
            {
              path: 'home/admin',
              element: <AuthGuard allowedRoles={['admin']} />,
              children: [
                {
                  index: true,
                  lazy: async () => ({
                    Component: (await import('app/pages/dashboards/home/AdminDashboard')).default,
                  }),
                },
              ],
            },
            {
              path: 'home/agence',
              element: <AuthGuard allowedRoles={['chef_agence']} />,
              children: [
                {
                  index: true,
                  lazy: async () => ({
                    Component: (await import('app/pages/dashboards/home/AgenceDashboard')).default,
                  }),
                },
              ],
            },
            {
              path: 'home/expediteur',
              element: <AuthGuard allowedRoles={['fournisseur']} />,
              children: [
                {
                  index: true,
                  lazy: async () => ({
                    Component: (await import('app/pages/dashboards/home/ExpediteurDashboard')).default,
                  }),
                },
              ],
            },
          ],
        },
      ],
    },
    {
      Component: AppLayout,
      children: [
        {
          path: 'settings',
          lazy: async () => ({
            Component: (await import('app/pages/settings/Layout')).default,
          }),
          children: [
            {
              index: true,
              element: <Navigate to="/settings/general" replace />,
            },
            {
              path: 'general',
              lazy: async () => ({
                Component: (await import('app/pages/settings/sections/General')).default,
              }),
            },
            {
              path: 'appearance',
              lazy: async () => ({
                Component: (await import('app/pages/settings/sections/Appearance')).default,
              }),
            },
          ],
        },
      ],
    },
  ],
};

export { protectedRoutes };