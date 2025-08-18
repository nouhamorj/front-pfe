// app/navigation/index.js
import { colis } from "./colis";
import { consolePickup } from "./consolePickup";
import { consoleRetour } from "./consoleRetour";
import { dashboards } from "./dashboards";
import { gestion } from "./gestionAdmin";
import { gestion_agence } from "./gestionAgence";
import { parametresAdmin } from "./ParametresAdmin";
import { parametresAgence } from "./ParametresAgence";
import { parametresExpediteur } from "./ParametresExpediteur";
import { pickup } from "./pickup";
import { runsheet } from "./runsheet";
import { runsheetAdmin } from "./runsheetAdmin";

export const navigation = [
    dashboards,
    gestion,
    gestion_agence,
    pickup,
    runsheet,
    consolePickup,
    consoleRetour,
    colis,
    runsheetAdmin,
    parametresAdmin,
    parametresAgence,
    parametresExpediteur
    
];

export const getNavigationByRole = (userRole) => {
    return navigation
        .filter(item => item.allowedRoles?.includes(userRole))
        .map(item => {
            if (item.childs && Array.isArray(item.childs)) {
                return {
                    ...item,
                    childs: item.childs.filter(child => child.allowedRoles?.includes(userRole))
                };
            }
            return item;
        });
};

export { baseNavigation } from './baseNavigation';