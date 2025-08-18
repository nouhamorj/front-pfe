// dashboards.js
import DashboardsIcon from 'assets/dualicons/dashboards.svg?react';
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant';

export const dashboards = {
    id: 'dashboards',
    type: NAV_TYPE_ROOT,
    title: 'ShippingLog',
    path: '/tableau-de-bord',
    Icon: DashboardsIcon,
    allowedRoles: ['admin', 'chef_agence', 'fournisseur'],
    childs: [
        // Pour fournisseur
        {
            id: 'bord-fournisseur',
            path: '/expediteur/tableau-de-bord',
            type: NAV_TYPE_ITEM,
            title: 'Tableau de bord',
            allowedRoles: ['fournisseur']
        },
        {
            id: 'recherche',
            path: '/expediteur/recherche-colis',
            type: NAV_TYPE_ITEM,
            title: 'Rechercher Un Colis',
            allowedRoles: ['fournisseur']
        },
        {
            id: 'temps-reel',
            path: '/expediteur/temps-réel',
            type: NAV_TYPE_ITEM,
            title: 'Temps Réel',
            allowedRoles: ['fournisseur']
        },

        // Pour chef d'agence
        {
            id: 'bord-agence',
            path: '/agence/tableau-de-bord',
            type: NAV_TYPE_ITEM,
            title: 'Tableau de bord Agence',
            allowedRoles: ['chef_agence']
        },
        {
            id: 'recherche-colis',
            path: '/agence/rechercher un colis',
            type: NAV_TYPE_ITEM,
            title: 'Rechercher un colis ',
            allowedRoles: ['chef_agence']
        },
        {
            id: 'accept-colis',
            path: '/agence/accepter-colis',
            type: NAV_TYPE_ITEM,
            title: 'Accepter au magasin',
            allowedRoles: ['chef_agence']
        },
        {
            id: 'modifier-colis',
            path: '/agence/modifier-colis',
            type: NAV_TYPE_ITEM,
            title: 'Modifier Colis',
            allowedRoles: ['chef_agence']
        },
        {
            id: 'generer-echange',
            path: '/agence/liste-echange',
            type: NAV_TYPE_ITEM,
            title: 'Colis échange ',
            allowedRoles: ['chef_agence']
        },

        // Pour admin
        {
            id: 'bord-admin',
            path: '/admin/tableau-de-bord',
            type: NAV_TYPE_ITEM,
            title: 'Tableau de bord Admin',
            allowedRoles: ['admin']
        },

    ]
};