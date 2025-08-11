import DashboardsIcon from 'assets/dualicons/dashboards.svg?react'
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant'


export const dashboards = {
    id: 'dashboards',
    type: NAV_TYPE_ROOT,
    title: 'ShippingLog',
    Icon: DashboardsIcon,
    allowedRoles: ['admin', 'chef_agence', 'fournisseur'],
    childs: [
        {
            id: 'bord',
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


    ]
}
