// Authentication utilities for React

export interface AuthState {
  userId: string | null;
  username: string | null;
}

export function getAuthState(): AuthState {
  return {
    userId: localStorage.getItem('userId'),
    username: localStorage.getItem('username')
  };
}

export function setAuthState(userId: string, username: string): void {
  localStorage.setItem('userId', userId);
  localStorage.setItem('username', username);
}

export function clearAuthState(): void {
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('userId');
}
