import {
  createContext,
  useContext,
  useState,
} from 'react';

import type {
  Dispatch,
  ReactNode,
  SetStateAction,
} from 'react';

import type { AuthUser } from '../types/auth.types';

import { getAccessToken, getUser } from '../utils/auth.storage';

interface AuthContextValue {
  user: AuthUser | null;
  setUser: Dispatch<
    SetStateAction<AuthUser | null>
  >;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<
  AuthContextValue | undefined
>(undefined);

export function AuthProvider({
  children,
}: AuthProviderProps) {
  // Nap phien truoc lan render dau de route bao ve khong redirect nham.
  const [user, setUser] = useState<AuthUser | null>(() =>
    getAccessToken() ? getUser() : null,
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuthContext must be used within AuthProvider.',
    );
  }

  return context;
}