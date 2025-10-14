// Authentication utilities for React
import type { UserResponse, AccessTokenModel } from './types';

export interface AuthState {
  userId: string | null;
  username: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  user: UserResponse | null;
}

export function getAuthState(): AuthState {
  const userDataStr = localStorage.getItem('userData');
  const credentialsStr = localStorage.getItem('credentials');
  
  let user: UserResponse | null = null;
  let accessToken: string | null = null;
  let refreshToken: string | null = null;

  if (userDataStr) {
    try {
      user = JSON.parse(userDataStr);
    } catch (e) {
      console.error('Failed to parse user data from localStorage:', e);
    }
  }

  if (credentialsStr) {
    try {
      const credentials: AccessTokenModel = JSON.parse(credentialsStr);
      accessToken = credentials.accessToken;
      refreshToken = credentials.refreshToken;
    } catch (e) {
      console.error('Failed to parse credentials from localStorage:', e);
    }
  }

  return {
    userId: user?.id || null,
    username: user?.username || null,
    accessToken,
    refreshToken,
    user
  };
}

export function setAuthState(user: UserResponse, credentials: AccessTokenModel): void {
  localStorage.setItem('userData', JSON.stringify(user));
  localStorage.setItem('credentials', JSON.stringify(credentials));
}

export function updateUserData(user: UserResponse): void {
  localStorage.setItem('userData', JSON.stringify(user));
}

export function clearAuthState(): void {
  localStorage.removeItem('userData');
  localStorage.removeItem('credentials');
}

export function isAuthenticated(): boolean {
  const token = getAuthState().accessToken;
  if (!token) return false;
  
  // Check if token is expired
  try {
    const credentialsStr = localStorage.getItem('credentials');
    if (credentialsStr) {
      const credentials: AccessTokenModel = JSON.parse(credentialsStr);
      const expirationTime = new Date(credentials.expirationTime);
      const now = new Date();
      
      if (now >= expirationTime) {
        // Token is expired, clear auth state
        clearAuthState();
        return false;
      }
    }
    return true;
  } catch (e) {
    console.error('Failed to check token expiration:', e);
    clearAuthState();
    return false;
  }
}

export function getAuthToken(): string | null {
  return getAuthState().accessToken;
}

export function getAuthHeaders(): { [key: string]: string } {
  const token = getAuthToken();
  const headers: { [key: string]: string } = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
}
