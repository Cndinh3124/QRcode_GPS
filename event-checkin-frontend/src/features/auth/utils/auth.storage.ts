import { STORAGE_KEYS } from '../../../constants/storage';
import type { AuthUser } from '../types/auth.types';

export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
}

export function removeAccessToken(): void {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

export function getUser(): AuthUser | null {
  const storedUser = localStorage.getItem(
    STORAGE_KEYS.USER,
  );

  if (!storedUser) {
    return null;
  }

  return JSON.parse(storedUser) as AuthUser;
}

export function setUser(user: AuthUser): void {
  localStorage.setItem(
    STORAGE_KEYS.USER,
    JSON.stringify(user),
  );
}

export function removeUser(): void {
  localStorage.removeItem(STORAGE_KEYS.USER);
}

export function clearAuth(): void {
  removeAccessToken();
  removeUser();
}