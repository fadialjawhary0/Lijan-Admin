import { Routes, Route, Navigate } from 'react-router-dom';

import PublicRoutes from './PublicRoutes';
import PrivateRoutes from './PrivateRoutes';
import PrivateRoute from './PrivateRoute';
import MainLayout from '../components/layout/MainLayout';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Default redirect to user-management */}
      <Route path="/" element={<Navigate to="/user-management" replace />} />

      {/* Public Routes */}
      {PublicRoutes}

      {/* Private Routes */}
      {PrivateRoutes.map(route => (
        <Route
          key={route?.key}
          path={route?.props?.path}
          element={
            <PrivateRoute>
              <MainLayout>{route?.props?.element}</MainLayout>
            </PrivateRoute>
          }
        />
      ))}

      {/* Catch-all route for unknown pages - redirect to user-management */}
      <Route path="*" element={<Navigate to="/user-management" replace />} />
    </Routes>
  );
};

export default AppRoutes;
