// src/app/navigation/gestion.js
//import { BuildingOfficeIcon, TruckIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import PrototypesIcon from 'assets/dualicons/prototypes.svg?react'
import {NAV_TYPE_ITEM } from 'constants/app.constant';

export const gestion = {
  id: 'gestion',
  type: NAV_TYPE_ITEM,
  title: 'Gestion',
  path:'/agence/liste-expediteurs',
  Icon: PrototypesIcon,
  allowedRoles: ['chef_agence'], 
  childs: [
    {
      id: 'expediteurs',
      type: NAV_TYPE_ITEM,
      path: '/admin/liste-expediteurs',
      title: 'Expéditeurs',
      allowedRoles: ['chef_agence'] 
    },
    {
      id: 'livreurs',
      type: NAV_TYPE_ITEM,
      path: '/admin/liste-livreurs',
      title: 'Livreurs',
      allowedRoles: ['chef_agence'] 
    },
  ],
};