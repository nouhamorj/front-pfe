// app/navigation/consolePickUp.js
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { NAV_TYPE_COLLAPSE, NAV_TYPE_ITEM } from 'constants/app.constant';

export const consolePickup = {
    id: 'console-pickup',
    type: NAV_TYPE_COLLAPSE,
    title: 'Console PickUp',
    path: '/agence/ajouter-console-pickup',
    Icon: DocumentArrowUpIcon,
    allowedRoles: ['chef_agence'],
    childs: [
        {
            id: 'accepter-console-pickup',
            type: NAV_TYPE_ITEM,
            path: '/agence/accepter-console-pickup',
            title: 'Accepter Console PickUp',
            allowedRoles: ['chef_agence']
        },
        {
            id: 'ajout-console-pickup',
            type: NAV_TYPE_ITEM,
            path: '/agence/ajouter-console-pickup',
            title: 'Ajouter une nouvelle console',
            allowedRoles: ['chef_agence']
        },
        {
            id: 'liste-console-pickup',
            type: NAV_TYPE_ITEM,
            path: '/agence/liste-console-pickup',
            title: 'Liste des consoles',
            allowedRoles: ['chef_agence']
        },
        
    ]
};