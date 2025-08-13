// app/navigation/index.js
import { consolePickup } from "./consolePickup";
import { consoleRetour } from "./consoleRetour";
import { dashboards } from "./dashboards";
import { gestion } from "./gestionAdmin";
import { gestion_agence } from "./gestionAgence";
import { pickup } from "./pickup";
import { runsheet } from "./runsheet";

export const navigation = [
    dashboards,
    gestion,
    gestion_agence,
    pickup,
    runsheet,
    consolePickup,
    consoleRetour

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