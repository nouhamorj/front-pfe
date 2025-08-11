import { NAV_TYPE_ITEM } from "constants/app.constant";
import DashboardsIcon from 'assets/dualicons/dashboards.svg?react';
import PrototypesIcon from 'assets/dualicons/prototypes.svg?react';
import FormsIcon from 'assets/dualicons/forms.svg?react'
import { TruckIcon } from '@heroicons/react/24/outline';

// Navigation complète avec les rôles autorisés
const allNavigation = [
  {
    id: 'dashboards',
    type: NAV_TYPE_ITEM,
    path: '/tableau-de-bord',
    title: 'Tableau de bord',
    Icon: DashboardsIcon,
    allowedRoles: ['admin', 'chef_agence', 'fournisseur'], // Accessible à tous les rôles
  },
];

// Fonction pour filtrer la navigation selon le rôle
export const getNavigationByRole = (userRole) => {
  return allNavigation.filter(item => 
    item.allowedRoles.includes(userRole)
  );
};

// Export original pour maintenir la compatibilité
export const baseNavigation = allNavigation;

// Fonction pour obtenir la navigation filtrée par rôle
export const getBaseNavigation = (userRole) => {
  const navigation = [
    {
      id: 'dashboards',
      type: NAV_TYPE_ITEM,
      title: 'Tableau de bord',
      Icon: DashboardsIcon,
    }
  ];

  // Ajouter la gestion pour les admins et chefs d'agence
  if (userRole === 'admin') {
    navigation.push({
      id: 'gestion',
      type: NAV_TYPE_ITEM,
      path: '/admin/liste-agences',
      title: 'Gestion',
      Icon: PrototypesIcon,
    });
  }

  // Ajouter PickUp pour les fournisseurs
  if (userRole === 'fournisseur') {
    navigation.push({
      id: 'pickup', 
      path: '/expediteur/ajouter-pickUp',
      type: NAV_TYPE_ITEM,
      title: 'PickUp',
      Icon: FormsIcon,
    });
  }

  // Ajouter PickUp pour les fournisseurs
  if (userRole === 'chef_agence') {
    navigation.push({
      id: 'runsheet', 
      path: '/agence/ajouter-runsheet',
      type: NAV_TYPE_ITEM,
      title: 'Runsheet',
      Icon: TruckIcon,
    });
  }

  return navigation;
};