// app/navigation/gestion.js
import PrototypesIcon from 'assets/dualicons/prototypes.svg?react';
import { NAV_TYPE_COLLAPSE, NAV_TYPE_ITEM } from 'constants/app.constant';

export const gestion = {
    id: 'gestion-admin',
    type: NAV_TYPE_COLLAPSE,
    title: 'Gestion',
    path: '/admin/liste-expediteurs',
    Icon: PrototypesIcon,
    allowedRoles: ['admin'],
    childs: [
        {
            id: 'liste-agences',
            type: NAV_TYPE_ITEM,
            path: '/admin/liste-agences',
            title: 'Agences',
            allowedRoles: ['admin']
        },
        {
            id: 'liste-expediteurs',
            type: NAV_TYPE_ITEM,
            path: '/admin/liste-expediteurs',
            title: 'Expéditeurs',
            allowedRoles: ['admin']
        },
        {
            id: 'liste-livreurs',
            type: NAV_TYPE_ITEM,
            path: '/admin/liste-livreurs',
            title: 'Livreurs',
            allowedRoles: ['admin']
        },
        {
            id: 'liste-chauffeurs',
            type: NAV_TYPE_ITEM,
            path: '/admin/liste-chauffeurs',
            title: 'Chauffeurs',
            allowedRoles: ['admin']
        }
    ]
};