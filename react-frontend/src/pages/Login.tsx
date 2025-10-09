import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, PatchDBApiError } from '../api/patchdb';
import { setAuthState, isAuthenticated } from '../api/auth';

const Login: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      showError('Please enter a username');
      return;
    }

    if (!password.trim()) {
      showError('Please enter a password');
      return;
    }

    if (!isLoginMode && password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    if (!isLoginMode && password.length < 6) {
      showError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let authResponse;
      
      if (isLoginMode) {
        authResponse = await loginUser(username.trim(), password);
      } else {
        authResponse = await registerUser(username.trim(), password);
      }

      // Store user data and credentials
      setAuthState(authResponse.user, authResponse.credentials);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      showError(error instanceof PatchDBApiError ? error.message : `${isLoginMode ? 'Login' : 'Registration'} failed`);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  const showError = (message: string) => {
    setError(message);
  };

  return (
    <div className="bg-light patch-background">
      <div className="container-fluid">
        <div className="row justify-content-center min-vh-100 align-items-center">
          <div className="col-12 col-sm-8 col-md-6 col-lg-4">
            <div className="card shadow">
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <h1 className="h2 fw-bold" style={{background: 'linear-gradient(135deg, #2c3e50, #e67e22)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                    🧵 PatchDB
                  </h1>
                  <p className="text-muted fs-6">Your personal patch collection adventure starts here!</p>
                  <p className="text-muted small">Snap, match, and collect patches from your university journey</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label fw-semibold">Username</label>
                    <input 
                      type="text" 
                      className="form-control form-control-lg" 
                      id="username" 
                      placeholder="Enter your username" 
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loading}
                      style={{borderRadius: '0.75rem', border: '2px solid #ecf0f1'}}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-semibold">Password</label>
                    <input 
                      type="password" 
                      className="form-control form-control-lg" 
                      id="password" 
                      placeholder="Enter your password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      style={{borderRadius: '0.75rem', border: '2px solid #ecf0f1'}}
                    />
                  </div>

                  {!isLoginMode && (
                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label fw-semibold">Confirm Password</label>
                      <input 
                        type="password" 
                        className="form-control form-control-lg" 
                        id="confirmPassword" 
                        placeholder="Confirm your password" 
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                        style={{borderRadius: '0.75rem', border: '2px solid #ecf0f1'}}
                      />
                    </div>
                  )}
                  
                  <div className="d-grid">
                    <button 
                      type="submit" 
                      className="btn btn-dark btn-lg" 
                      disabled={loading}
                    >
                      {loading && (
                        <span className="spinner-border spinner-border-sm me-2"></span>
                      )}
                      {isLoginMode ? 'Sign In' : 'Create Account'}
                    </button>
                  </div>
                </form>
                
                <div className="mt-3">
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}
                </div>

                {/* Alternative action */}
                <div className="text-center mt-3">
                  <button 
                    type="button"
                    className="btn btn-link text-muted"
                    onClick={toggleMode}
                    disabled={loading}
                  >
                    {isLoginMode 
                      ? "Don't have an account? Create one" 
                      : "Already have an account? Sign in"
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
