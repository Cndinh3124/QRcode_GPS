import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '../../../constants/routes';

import { login } from '../api/auth.api';
import { useAuthContext } from '../context/AuthContext';

import {
  clearAuth,
  setAccessToken,
  setUser,
} from '../utils/auth.storage';

export function useAuth() {
  const navigate = useNavigate();

  const { user, setUser: setCurrentUser } =
    useAuthContext();

  const loginMutation = useMutation({
    mutationFn: login,

    onSuccess: ({ access_token, user }) => {
      setAccessToken(access_token);

      setUser(user);

      setCurrentUser(user);

      navigate(ROUTES.DASHBOARD, {
        replace: true,
      });
    },
  });

  function logout() {
    clearAuth();

    setCurrentUser(null);

    navigate(ROUTES.LOGIN, {
      replace: true,
    });
  }

  return {
    user,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    logout,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
  };
}