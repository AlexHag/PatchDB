import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

interface NavigationProps {
  showDashboardLink?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ showDashboardLink = false }) => {
  const { username, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-sm navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/dashboard">PatchDB</Link>
        <div className="navbar-nav ms-auto">
          {username && (
            <span className="navbar-text me-3">Hello, {username}</span>
          )}
          {showDashboardLink && (
            <Link to="/dashboard" className="btn btn-outline-light btn-sm me-2">Dashboard</Link>
          )}
          {username && (
            <button className="btn btn-outline-light btn-sm" onClick={logout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
