// app/navigation/gestionAgence.js
import PrototypesIcon from 'assets/dualicons/prototypes.svg?react';
import { NAV_TYPE_COLLAPSE, NAV_TYPE_ITEM } from 'constants/app.constant';

export const gestion_agence = {
    id: 'gestion-agence',
    type: NAV_TYPE_COLLAPSE,
    title: 'Gestion',
    path: '/agence/liste-expediteurs',
    Icon: PrototypesIcon,
    allowedRoles: ['chef_agence'],
    childs: [
        {
            id: 'agence-expediteurs',
            type: NAV_TYPE_ITEM,
            path: '/agence/liste-expediteurs',
            title: 'Expéditeurs',
            allowedRoles: ['chef_agence']
        },
        {
            id: 'agence-livreurs',
            type: NAV_TYPE_ITEM,
            path: '/agence/liste-livreurs',
            title: 'Livreurs',
            allowedRoles: ['chef_agence']
        }
    ]
};