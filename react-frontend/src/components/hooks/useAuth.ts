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
    setAuthState({ 
      userId: null, 
      username: null, 
      accessToken: null, 
      refreshToken: null, 
      user: null 
    });
    navigate('/');
  }, [navigate]);

  const requireAuth = useCallback((): string | null => {
    if (!authState.userId || !authState.accessToken) {
      navigate('/');
      return null;
    }
    return authState.userId;
  }, [authState.userId, authState.accessToken, navigate]);

  return {
    ...authState,
    isAuthenticated: !!authState.userId && !!authState.accessToken,
    logout,
    requireAuth
  };
}
