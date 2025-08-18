import SettingIcon from "assets/dualicons/setting.svg?react";
import { NAV_TYPE_COLLAPSE, NAV_TYPE_ITEM } from 'constants/app.constant';

export const parametresAgence= {
    id: 'parametres-agence',
    type: NAV_TYPE_COLLAPSE,
    title: 'Paramètres',
    path: '/agence/mon-profil',
    Icon: SettingIcon,
    allowedRoles: ['chef_agence'],
    childs: [
        {
            id: 'profil',
            type: NAV_TYPE_ITEM,
            path: '/agence/mon-profil',
            title: 'Mon Profil',
            allowedRoles: ['chef_agence']
        },
        {
            id: 'apparence',
            type: NAV_TYPE_ITEM,
            path: '/agence/personnaliser-mon-theme',
            title: 'Apparence',
            allowedRoles: ['chef_agence']
        },
      
    ]
};