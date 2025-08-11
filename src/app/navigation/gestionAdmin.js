// src/app/navigation/gestion.js
//import { BuildingOfficeIcon, TruckIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import PrototypesIcon from 'assets/dualicons/prototypes.svg?react'
import {NAV_TYPE_ITEM } from 'constants/app.constant';

export const gestion = {
  id: 'gestion',
  type: NAV_TYPE_ITEM,
  title: 'Gestion',
  path:'/admin/liste-expediteurs',
  Icon: PrototypesIcon,
  allowedRoles: ['admin'], 
  childs: [
    {
      id: 'agences',
      type: NAV_TYPE_ITEM,
      path: '/admin/liste-agences',
      title: 'Agences',
      allowedRoles: ['admin'] 
    },
    {
      id: 'expediteurs',
      type: NAV_TYPE_ITEM,
      path: '/admin/liste-expediteurs',
      title: 'Expéditeurs',
      allowedRoles: ['admin'] 
    },
    {
      id: 'livreurs',
      type: NAV_TYPE_ITEM,
      path: '/admin/liste-livreurs',
      title: 'Livreurs',
      allowedRoles: ['admin'] 
    },
  ],
};