import { dashboards } from "./dashboards";
import { gestion } from "./gestionAdmin";
import { pickup } from "./pickup";
import { runsheet} from "./runsheet";

// Navigation complète (les rôles sont définis dans chaque module)
const allNavigationModules = [
    dashboards,
    gestion,
    pickup,
    runsheet,
];

// Export de la navigation complète (pour compatibilité)
export const navigation = allNavigationModules;

// Fonction pour obtenir la navigation filtrée par rôle
export const getNavigationByRole = (userRole) => {
    return allNavigationModules.filter(module => 
        module.allowedRoles && module.allowedRoles.includes(userRole)
    );
};

// Export original pour compatibilité
export { baseNavigation } from './baseNavigation';