import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

import { ROUTES } from '../constants/routes';

import { useAuthContext } from '../features/auth/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const { user } = useAuthContext();

  if (!user) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
      />
    );
  }

  return <>{children}</>;
}