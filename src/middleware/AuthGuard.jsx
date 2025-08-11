import { Navigate, useLocation, useOutlet } from 'react-router';
import { useAuthContext } from 'app/contexts/auth/context';
import { GHOST_ENTRY_PATH, REDIRECT_URL_KEY } from '../constants/app.constant';

const getDefaultRouteForRole = (role) => {
  const normalizedRole = role?.toLowerCase();
  switch(normalizedRole) {
    case 'fournisseur':
      return '/expediteur/tableau-de-bord';
    case 'chef_agence':
      return '/agence/tableau-de-bord'; 
    case 'admin':
      return '/admin/tableau-de-bord'; 
    default:
      return '/unauthorized';
  }
};

export default function AuthGuard({ allowedRoles }) {
  const outlet = useOutlet();
  const { isAuthenticated, isInitialized, user } = useAuthContext();
  const location = useLocation();

  const userRole = user?.role?.toLowerCase();

  // En cours d'initialisation
  if (!isInitialized || (isAuthenticated && !user)) {
    return <div>Chargement...</div>;
  }

  if (!isInitialized || (isAuthenticated && !userRole)) {
    return <div>Chargement des autorisations...</div>;
  }


  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to={`${GHOST_ENTRY_PATH}?${REDIRECT_URL_KEY}=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  // Rôle non autorisé 
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.log('Access denied - redirecting to appropriate page for role:', userRole);
    
    // Au lieu de rediriger vers /unauthorized, rediriger vers la page appropriée pour ce rôle
    const defaultRoute = getDefaultRouteForRole(userRole);
    
    if (location.pathname === '/' || location.pathname === '') {
      return <Navigate to={defaultRoute} replace />;
    }

    return <Navigate to={defaultRoute} replace />;
  }
  return <>{outlet}</>;
}