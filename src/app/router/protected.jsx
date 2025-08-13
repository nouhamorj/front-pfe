
import { Navigate } from 'react-router';
import { AppLayout } from 'app/layouts/AppLayout';
import { DynamicLayout } from 'app/layouts/DynamicLayout';
import AuthGuard from 'middleware/AuthGuard';

const protectedRoutes = {
  id: 'protected',
  Component: AuthGuard, 
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
            {
            path: 'liste-agences',
              lazy: async () => ({
                 Component: (await import('app/pages/Admin/ListeAgence')).default,
               }),
            },
            {
            path: 'liste-livreurs',
              lazy: async () => ({
                 Component: (await import('app/pages/Admin/ListeLivreur')).default,
               }),
            },
            {
            path: 'liste-expediteurs',
              lazy: async () => ({
                 Component: (await import('app/pages/Admin/ListeExpediteur')).default,
               }),
            },
            {
              path : 'ajouter-expediteur',
              lazy: async () => ({
                 Component: (await import('app/pages/Admin/AddExp')).default,
               }),
            },
            {
              path : 'modifier-expediteur/:id',
              lazy: async () => ({
                 Component: (await import('app/pages/Admin/UpdateExp')).default,
               }),
            },
            {
              path : 'ajouter-livreur',
              lazy: async () => ({
                 Component: (await import('app/pages/Admin/AddLivreur')).default,
               }),
            },
            {
              path : 'modifier-livreur/:id',
              lazy: async () => ({
                 Component: (await import('app/pages/Admin/UpdateLivreur')).default,
               }),
            },
            {
              path : 'ajouter-agence',
              lazy: async () => ({
                 Component: (await import('app/pages/Admin/AddAgence')).default,
               }),
            },
            {
              path : 'liste-chauffeurs',
              lazy: async () => ({
                 Component: (await import('app/pages/Admin/ListeChauffeurs')).default,
               }),
            },
            {
              path : 'ajouter-chauffeur',
              lazy: async () => ({
                 Component: (await import('app/pages/Admin/AddChauffeur')).default,
               }),
            },
            {
              path : 'modifier-chauffeur/:id',
              lazy: async () => ({
                 Component: (await import('app/pages/Admin/EditChauufeur')).default,
               }),
            },
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
            {
              path: 'liste-expediteurs',
              lazy: async () => ({
                Component: (await import('app/pages/Agence/ListeExpediteur')).default,
              }),
            },
            {
              path: 'ajouter-expediteur',
              lazy: async () => ({
                Component: (await import('app/pages/Agence/AddExp')).default,
              }),
            },
            {
              path: 'modifier-expediteur/:id',
              lazy: async () => ({
                Component: (await import('app/pages/Agence/UpdateExp')).default,
              }),
            },
            {
              path: 'liste-livreurs',
              lazy: async () => ({
                Component: (await import('app/pages/Agence/ListeLivreur')).default,
              }),
            },
            {
              path: 'ajouter-livreur',
              lazy: async () => ({
                Component: (await import('app/pages/Agence/AddLivreur')).default,
              }),
            },
            {
              path: 'modifier-livreur/:id',
              lazy: async () => ({
                Component: (await import('app/pages/Agence/UpdateLivreur')).default,
              }),
            },
            {
              path: 'ajouter-console-pickup',
              lazy: async () => ({
                Component: (await import('app/pages/Agence/AddConsolePickup')).default,
              }),
            },
            {
              path: 'liste-console-pickup',
              lazy: async () => ({
                Component: (await import('app/pages/Agence/consolePickupList')).default,
              }),
            },
            {
              path: 'detail-console-pickup/:id_console',
              lazy: async () => ({
                Component: (await import('app/pages/Agence/detailConsolePickup')).default,
              }),
            },
            {
              path: 'accepter-console-pickup',
              lazy: async () => ({
                Component: (await import('app/pages/Agence/AcceptConsolePickup')).default,
              }),
            },
            {
              path: 'valider-console-pickup/:id',
              lazy: async () => ({
                Component: (await import('app/pages/Agence/ValiderConsolePickup')).default,
              }),
            },
            {
              path: 'accepter-colis',
              lazy: async () => ({
                Component: (await import('app/pages/Agence/AccepterColis')).default,
              }),
            },
            {
              path: 'ajouter-console-retour',
              lazy: async () => ({
                Component: (await import('app/pages/Agence/AddConsoleRetour')).default,
              }),
            },
            {
              path: 'liste-console-retour',
              lazy: async () => ({
                Component: (await import('app/pages/Agence/ConsoleRetourList')).default,
              }),
            },
            {
              path: 'detail-console-retour/:id_console',
              lazy: async () => ({
                Component: (await import('app/pages/Agence/DetailConsoleRetour')).default,
              }),
            },
            {
              path: 'accepter-console-retour',
              lazy: async () => ({
                Component: (await import('app/pages/Agence/AcceptConsoleRetour')).default,
              }),
            },
            {
              path: 'valider-console-retour/:id',
              lazy: async () => ({
                Component: (await import('app/pages/Agence/ValiderConsoleRetour')).default,
              }),
            },
            {
              path: 'modifier-colis',
              lazy: async () => ({
                Component: (await import('app/pages/Agence/ModifCmd')).default,
              }),
            },
          
          
          
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
            {
              path: 'ajouter-pickUp',
              lazy: async () => ({
                Component: (await import('app/pages/Expediteur/AddCmd')).default,
              }),
            },
            {
              path: 'modifier-commande/:id',
              lazy: async () => ({
                Component: (await import('app/pages/Expediteur/EditCmd')).default,
              }),
            },
            {
              path: 'colis-en-attente',
              lazy: async () => ({
                Component: (await import('app/pages/Expediteur/ColisAttente')).default,
              }),
            },
            {
              path: 'colis-en-attente-imprimés',
              lazy: async () => ({
                Component: (await import('app/pages/Expediteur/ColisAttenteImprimes')).default,
              }),
            },
            {
              path: 'print-bordereau/:id_manifeste',
              lazy: async () => ({
                Component: (await import('app/pages/Expediteur/PrintBorderaux')).default,
              }),
            },
            {
              path: 'print-all-bordereaux',
              lazy: async () => ({
                Component: (await import('app/pages/Expediteur/PrintAllBorderaux')).default,
              }),
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