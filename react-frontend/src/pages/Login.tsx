import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/patchdb';
import { setAuthState, isAuthenticated } from '../api/auth';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
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

    setLoading(true);
    setError('');

    try {
      const user = await loginUser(username.trim());
      // Store user data
      setAuthState(user.id, user.username);
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
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
                  <h1 className="h3 fw-bold text-dark">PatchDB</h1>
                  <p className="text-muted">Track your patch collection</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input 
                      type="text" 
                      className="form-control form-control-lg" 
                      id="username" 
                      placeholder="Enter your username" 
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  
                  <div className="d-grid">
                    <button 
                      type="submit" 
                      className="btn btn-dark btn-lg" 
                      disabled={loading}
                    >
                      {loading && (
                        <span className="spinner-border spinner-border-sm me-2"></span>
                      )}
                      Continue
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
