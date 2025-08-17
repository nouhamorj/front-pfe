// app/navigation/pickup.js
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { NAV_TYPE_COLLAPSE, NAV_TYPE_ITEM } from 'constants/app.constant';

export const runsheetAdmin = {
    id: 'runsheet_admin',
    type: NAV_TYPE_COLLAPSE,
    title: 'Runsheets',
    path: '/admin/runsheet-en-cours',
    Icon: ClipboardDocumentIcon ,
    allowedRoles: ['admin'],
    childs: [
          {
            id: 'runsheet-en-cours',
            path: '/admin/runsheet-en-cours',
            type: NAV_TYPE_ITEM,
            title: 'Runsheets en cours',
            allowedRoles: ['admin']
        },
        {
            id: 'Runsheets-du-jour-valides',
            type: NAV_TYPE_ITEM,
            path: '/admin/runsheet-validés',
            title: "Runsheets du jour validés",
            allowedRoles: ['admin']
        },
        {
            id: 'delete-runsheet',
            type: NAV_TYPE_ITEM,
            path: '/admin/supprimer-runsheet',
            title: 'Supprimer Runsheets',
            allowedRoles: ['admin']
        },
    ]
};