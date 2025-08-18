import SettingIcon from "assets/dualicons/setting.svg?react";
import { NAV_TYPE_COLLAPSE, NAV_TYPE_ITEM } from 'constants/app.constant';

export const parametresExpediteur= {
    id: 'parametres-expediteur',
    type: NAV_TYPE_COLLAPSE,
    title: 'Paramètres',
    path: '/expediteur/mon-profil',
    Icon: SettingIcon,
    allowedRoles: ['fournisseur'],
    childs: [
        {
            id: 'profil',
            type: NAV_TYPE_ITEM,
            path: '/expediteur/mon-profil',
            title: 'Mon Profil',
            allowedRoles: ['fournisseur']
        },
        {
            id: 'apparence',
            type: NAV_TYPE_ITEM,
            path: '/expediteur/personnaliser-mon-theme',
            title: 'Apparence',
            allowedRoles: ['fournisseur']
        },
      
    ]
};