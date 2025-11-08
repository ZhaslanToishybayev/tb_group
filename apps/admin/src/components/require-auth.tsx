import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../providers/auth-provider';
import FullScreenLoader from './loading/full-screen-loader';

type RequireAuthProps = React.PropsWithChildren;

export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
