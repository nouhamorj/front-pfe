// Import Dependencies
import { UserIcon } from "@heroicons/react/24/outline";
import { TbPalette } from "react-icons/tb";

// Local Imports
import SettingIcon from "assets/dualicons/setting.svg?react";
import { NAV_TYPE_ITEM } from "constants/app.constant";

// ----------------------------------------------------------------------

export const settings = {
    id: 'settings',
    type: NAV_TYPE_ITEM,
    path: '/settings',
    title: 'Paramètres',
    Icon: SettingIcon,
    childs: [
        {
            id: 'general',
            type: NAV_TYPE_ITEM,
            path: '/settings/general',
            title: 'Général',
            Icon: UserIcon,
        },
        {
            id: 'appearance',
            type: NAV_TYPE_ITEM,
            path: '/settings/appearance',
            title: 'Apparence',
            Icon: TbPalette,
        },
    ]
}