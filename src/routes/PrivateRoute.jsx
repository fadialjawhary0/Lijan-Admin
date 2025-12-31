import { useAuth } from '../context';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    localStorage.setItem('redirectAfterLogin', location?.pathname);
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
