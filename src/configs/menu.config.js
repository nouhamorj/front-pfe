import {
  NAV_TYPE_ITEM,
  NAV_TYPE_COLLAPSE,
} from "constants/app.constant";
import {
  DashboardIcon,
  PackageIcon,
  UsersIcon,
  TruckIcon,
  // ... autres icônes
} from "@heroicons/react";

export const getMenuForRole = (role) => {
  const commonItems = [
    {
      id: "dashboard",
      type: NAV_TYPE_ITEM,
      path: `/${role}/tableau-de-bord`,
      title: "Tableau de bord",
      transKey: "menu.dashboard",
      Icon: DashboardIcon,
    },
  ];

  switch (role) {
    case 'fournisseur':
      return [
        ...commonItems,
        {
          id: "shipments",
          type: NAV_TYPE_ITEM,
          path: "/expediteur/envois",
          title: "Mes envois",
          transKey: "menu.shipments",
          Icon: PackageIcon,
        },
        // ... autres items pour fournisseur
      ];

    case 'chef_agence':
      return [
        ...commonItems,
        {
          id: "deliveries",
          type: NAV_TYPE_COLLAPSE,
          path: "/agence/livraisons",
          title: "Gestion livraisons",
          transKey: "menu.deliveries",
          Icon: TruckIcon,
          children: [
            {
              id: "pending",
              path: "/agence/livraisons/en-attente",
              title: "En attente",
            },
            // ... sous-items
          ],
        },
      ];

    case 'admin':
      return [
        ...commonItems,
        {
          id: "users",
          type: NAV_TYPE_ITEM,
          path: "/admin/utilisateurs",
          title: "Utilisateurs",
          transKey: "menu.users",
          Icon: UsersIcon,
        },
        // ... autres items admin
      ];

    default:
      return commonItems;
  }
};