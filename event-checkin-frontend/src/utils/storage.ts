const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER: 'user',
} as const;

export interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

/**
 * Access Token
 */

export function getAccessToken(): string | null {
  return localStorage.getItem(
    STORAGE_KEYS.ACCESS_TOKEN,
  );
}

export function setAccessToken(
  token: string,
): void {
  localStorage.setItem(
    STORAGE_KEYS.ACCESS_TOKEN,
    token,
  );
}

export function removeAccessToken(): void {
  localStorage.removeItem(
    STORAGE_KEYS.ACCESS_TOKEN,
  );
}

/**
 * User
 */

export function getStoredUser(): StoredUser | null {
  const user =
    localStorage.getItem(
      STORAGE_KEYS.USER,
    );

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user) as StoredUser;
  } catch {
    removeStoredUser();
    return null;
  }
}

export function setStoredUser(
  user: StoredUser,
): void {
  localStorage.setItem(
    STORAGE_KEYS.USER,
    JSON.stringify(user),
  );
}

export function removeStoredUser(): void {
  localStorage.removeItem(
    STORAGE_KEYS.USER,
  );
}

/**
 * Clear authentication data
 */

export function clearAuthStorage(): void {
  removeAccessToken();
  removeStoredUser();
}