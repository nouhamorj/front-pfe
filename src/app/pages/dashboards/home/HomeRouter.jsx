// src/app/pages/dashboards/home/HomeRouter.jsx
import { Navigate } from 'react-router';
import { useAuthContext } from "../../../contexts/auth/context";

const HomeRouter = () => {
  const { user, isInitialized } = useAuthContext();

  console.log('HomeRouter - isInitialized:', isInitialized);
  console.log('HomeRouter - User:', user);
  console.log('HomeRouter - User role:', user?.role);

  if (!isInitialized) {
    console.log('HomeRouter - Waiting for initialization...');
    return <div>Loading...</div>;
  }

  if (!user || !user.role) {
    console.log('HomeRouter - No user or role, redirecting to /login');
    return <Navigate to="/se-connecter" replace />;
  }

  const role = user.role.toLowerCase();
  console.log('HomeRouter - Normalized role:', role);

  switch (role) {
    case 'admin':
      console.log('HomeRouter - Redirecting to admin dashboard');
      return <Navigate to="/dashboards/home/admin" replace />;
    case 'fournisseur':
      console.log('HomeRouter - Redirecting to fournisseur dashboard');
      return <Navigate to="/dashboards/home/expediteur" replace />;
    case 'chef_agence':
      console.log('HomeRouter - Redirecting to chef_agence dashboard');
      return <Navigate to="/dashboards/home/agence" replace />;
    default:
      console.log('HomeRouter - Unknown role, redirecting to unauthorized');
      return <Navigate to="/unauthorized" replace />;
  }
};

export default HomeRouter;