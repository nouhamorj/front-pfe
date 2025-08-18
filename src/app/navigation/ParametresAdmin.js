import SettingIcon from "assets/dualicons/setting.svg?react";
import { NAV_TYPE_COLLAPSE, NAV_TYPE_ITEM } from 'constants/app.constant';

export const parametresAdmin= {
    id: 'parametres-admin',
    type: NAV_TYPE_COLLAPSE,
    title: 'Paramètres',
    path: '/admin/mon-profil',
    Icon: SettingIcon,
    allowedRoles: ['admin'],
    childs: [
        {
            id: 'profil',
            type: NAV_TYPE_ITEM,
            path: '/admin/mon-profil',
            title: 'Mon Profil',
            allowedRoles: ['admin']
        },
        {
            id: 'apparence',
            type: NAV_TYPE_ITEM,
            path: '/admin/personnaliser-mon-theme',
            title: 'Apparence',
            allowedRoles: ['admin']
        },
      
    ]
};