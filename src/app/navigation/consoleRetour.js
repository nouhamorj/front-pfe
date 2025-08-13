// app/navigation/consoleretour.js
import { ArrowUturnDownIcon } from '@heroicons/react/24/outline';
import { NAV_TYPE_COLLAPSE, NAV_TYPE_ITEM } from 'constants/app.constant';

export const consoleRetour = {
    id: 'console-retour',
    type: NAV_TYPE_COLLAPSE,
    title: 'Console Retour',
    path: '/agence/ajouter-console-retour',
    Icon: ArrowUturnDownIcon,
    allowedRoles: ['chef_agence'],
    childs: [
        {
            id: 'accepter-console-retour',
            type: NAV_TYPE_ITEM,
            path: '/agence/accepter-console-retour',
            title: 'Accepter Console retour',
            allowedRoles: ['chef_agence']
        },
        {
            id: 'ajout-console-retour',
            type: NAV_TYPE_ITEM,
            path: '/agence/ajouter-console-retour',
            title: 'Ajouter une nouvelle console',
            allowedRoles: ['chef_agence']
        },
        {
            id: 'liste-console-retour',
            type: NAV_TYPE_ITEM,
            path: '/agence/liste-console-retour',
            title: 'Liste des consoles',
            allowedRoles: ['chef_agence']
        }
        
    ]
};