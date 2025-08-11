
import FormsIcon from 'assets/dualicons/forms.svg?react'
import { NAV_TYPE_ITEM } from 'constants/app.constant';

export const pickup = {
  id: 'pickup',
  type: NAV_TYPE_ITEM,
  title: 'Commandes',
  path:'/expediteur/ajouter-pickUp',
  Icon: FormsIcon,
  allowedRoles: ['fournisseur'], 
  childs: [
    {
      id: 'addColis',
      type: NAV_TYPE_ITEM,
      path: '/expediteur/ajouter-pickUp',
      title: 'Nouvelle commande',
      allowedRoles: ['fournisseur']
    },
    {
      id: 'impressions',
      type: NAV_TYPE_ITEM,
      path: '/expediteur/colis-en-attente',
      title: "Colis en attente d'impression",
      allowedRoles: ['fournisseur']
    },
    {
      id: 'impressions',
      type: NAV_TYPE_ITEM,
      path: '/expediteur/colis-en-attente-imprimés',
      title: 'Colis en attente imprimés',
      allowedRoles: ['fournisseur']
    },
  ],
};