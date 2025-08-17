import AppsIcon from 'assets/dualicons/applications.svg?react'
import { NAV_TYPE_COLLAPSE, NAV_TYPE_ITEM } from 'constants/app.constant';

export const colis = {
    id: 'colis',
    type: NAV_TYPE_COLLAPSE,
    title: 'Colis',
    path: '/admin/rechercher-colis',
    Icon:  AppsIcon,
    allowedRoles: ['admin'],
    childs: [
          {
            id: 'recherche-admin',
            path: '/admin/rechercher-colis',
            type: NAV_TYPE_ITEM,
            title: 'Rechercher un colis',
            allowedRoles: ['admin']
        },
        {
            id: 'modif',
            type: NAV_TYPE_ITEM,
            path: '/admin/modifier-colis',
            title: 'Modifier Colis',
            allowedRoles: ['admin']
        },
        {
            id: 'delete',
            type: NAV_TYPE_ITEM,
            path: '/admin/supprimer-colis',
            title: 'Supprimer Colis',
            allowedRoles: ['admin']
        }
    ]
};