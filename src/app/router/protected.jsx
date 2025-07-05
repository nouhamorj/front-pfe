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
          lazy: async () => ({
            Component: (await import('app/pages/dashboards/home/HomeRouter')).default,
          }),
        },
        // Routes pour Admin avec préfixe admin/
        {
          path: 'admin',
          element: <AuthGuard allowedRoles={['admin']} />,
          children: [
            {
              index: true,
              element: <Navigate to="/admin/tableau-de-bord" replace />,
            },
            {
              path: 'tableau-de-bord',
              lazy: async () => ({
                Component: (await import('app/pages/Admin/AdminDashboard')).default,
              }),
            },
            // Ajoutez d'autres routes admin ici si nécessaire
            // {
            //   path: 'users',
            //   lazy: async () => ({
            //     Component: (await import('app/pages/Admin/UserManagement')).default,
            //   }),
            // },
          ],
        },
        // Routes pour Chef d'agence avec préfixe agence/
        {
          path: 'agence',
          element: <AuthGuard allowedRoles={['chef_agence']} />,
          children: [
            {
              index: true,
              element: <Navigate to="/agence/tableau-de-bord" replace />,
            },
            {
              path: 'tableau-de-bord',
              lazy: async () => ({
                Component: (await import('app/pages/Agence/AgenceDashboard')).default,
              }),
            },
            // Ajoutez d'autres routes agence ici si nécessaire
            // {
            //   path: 'deliveries',
            //   lazy: async () => ({
            //     Component: (await import('app/pages/Agence/DeliveryManagement')).default,
            //   }),
            // },
          ],
        },
        // Routes pour Expéditeur avec préfixe expediteur/
        {
          path: 'expediteur',
          element: <AuthGuard allowedRoles={['fournisseur']} />,
          children: [
            {
              index: true,
              element: <Navigate to="/expediteur/tableau-de-bord" replace />,
            },
            {
              path: 'tableau-de-bord',
              lazy: async () => ({
                Component: (await import('app/pages/Expediteur/ExpediteurDashboard')).default,
              }),
            },
            // Ajoutez d'autres routes expéditeur ici si nécessaire
            // {
            //   path: 'orders',
            //   lazy: async () => ({
            //     Component: (await import('app/pages/Expediteur/OrderManagement')).default,
            //   }),
            // },
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