import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface MobileFooterProps {}

const MobileFooter: React.FC<MobileFooterProps> = () => {
  const location = useLocation();

  // Helper function to check if current route matches
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="mobile-footer">
      <div className="mobile-footer-content">
        {/* Dashboard */}
        <Link 
          to="/dashboard" 
          className={`mobile-footer-item ${isActive('/dashboard') ? 'active' : ''}`}
        >
          <span className="mobile-footer-icon">🏠</span>
          <span className="mobile-footer-label">Dashboard</span>
        </Link>

        {/* Search */}
        <Link 
          to="/search" 
          className={`mobile-footer-item ${isActive('/search') ? 'active' : ''}`}
        >
          <span className="mobile-footer-icon">🔍</span>
          <span className="mobile-footer-label">Search</span>
        </Link>

        {/* Upload - Center/Primary button */}
        <Link 
          to="/upload" 
          className={`mobile-footer-item upload-primary ${isActive('/upload') ? 'active' : ''}`}
        >
          <span className="mobile-footer-icon upload-icon">📸</span>
          <span className="mobile-footer-label">Upload</span>
        </Link>

        {/* Placeholder - Empty for now */}
        <div className="mobile-footer-item placeholder">
          <span className="mobile-footer-icon">⚫</span>
          <span className="mobile-footer-label">More</span>
        </div>

        {/* Profile */}
        <Link 
          to="/profile" 
          className={`mobile-footer-item ${isActive('/profile') ? 'active' : ''}`}
        >
          <span className="mobile-footer-icon">👤</span>
          <span className="mobile-footer-label">Profile</span>
        </Link>
      </div>
    </nav>
  );
};

export default MobileFooter;
