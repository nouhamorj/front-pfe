// app/navigation/runsheet.js

import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { NAV_TYPE_COLLAPSE, NAV_TYPE_ITEM } from 'constants/app.constant';

export const runsheet = {
    id: 'runsheet',
    type: NAV_TYPE_COLLAPSE,
    title: 'Runsheet',
    path: '/agence/ajouter-runsheet',
    Icon: ClipboardDocumentIcon,
    allowedRoles: ['chef_agence'],
    childs: [
        {
            id: 'ajout-runsheet',
            type: NAV_TYPE_ITEM,
            path: '/agence/ajouter-runsheet',
            title: 'Ajouter Runsheet',
            allowedRoles: ['chef_agence']
        },
        {
            id: 'imprimer-runsheet',
            type: NAV_TYPE_ITEM,
            path: '/agence/imprimer-runsheet',
            title: 'Imprimer',
            allowedRoles: ['chef_agence']
        },
        {
            id: 'valider-retour',
            type: NAV_TYPE_ITEM,
            path: '/agence/valider-avec-retour',
            title: 'Valider avec retour',
            allowedRoles: ['chef_agence']
        },
        {
            id: 'tout-livre',
            type: NAV_TYPE_ITEM,
            path: '/agence/valider-tout-livre',
            title: 'Valider tout livré',
            allowedRoles: ['chef_agence']
        },
        {
            id: 'runsheet-en-cours',
            type: NAV_TYPE_ITEM,
            path: '/agence/runsheet-en-cours',
            title: 'Runsheets En Cours',
            allowedRoles: ['chef_agence']
        },
        {
            id: 'runsheet-valide',
            type: NAV_TYPE_ITEM,
            path: '/agence/runsheet-valide-jour',
            title: 'Runsheets du jour validés',
            allowedRoles: ['chef_agence']
        }
    ]
};