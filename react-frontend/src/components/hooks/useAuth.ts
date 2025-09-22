// Custom hook for authentication
import { useState, useEffect, useCallback } from 'react';
import { getAuthState, clearAuthState, type AuthState } from '../../api/auth';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(getAuthState());
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => {
      setAuthState(getAuthState());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const logout = useCallback(() => {
    clearAuthState();
    setAuthState({ userId: null, username: null });
    navigate('/');
  }, [navigate]);

  const requireAuth = useCallback((): string | null => {
    if (!authState.userId) {
      navigate('/');
      return null;
    }
    return authState.userId;
  }, [authState.userId, navigate]);

  return {
    ...authState,
    isAuthenticated: !!authState.userId,
    logout,
    requireAuth
  };
}
