import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface MobileFooterProps {}

const MobileFooter: React.FC<MobileFooterProps> = () => {
  const location = useLocation();

  // Helper function to check if current route matches
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // SVG Icons
  const HomeIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="footer-svg-icon">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  );

  const SearchIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="footer-svg-icon">
      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    </svg>
  );

  const CameraIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="footer-svg-icon">
      <circle cx="12" cy="12" r="3.2"/>
      <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
    </svg>
  );

  const DotsIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="footer-svg-icon">
      <path d="M6,10A2,2 0 0,1 8,12A2,2 0 0,1 6,14A2,2 0 0,1 4,12A2,2 0 0,1 6,10M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M18,10A2,2 0 0,1 20,12A2,2 0 0,1 18,14A2,2 0 0,1 16,12A2,2 0 0,1 18,10Z"/>
    </svg>
  );

  const ProfileIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="footer-svg-icon">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  );

  return (
    <nav className="mobile-footer">
      <div className="mobile-footer-content">
        {/* Dashboard */}
        <Link 
          to="/dashboard" 
          className={`mobile-footer-item ${isActive('/dashboard') ? 'active' : ''}`}
        >
          <span className="mobile-footer-icon">
            <HomeIcon />
          </span>
          <span className="mobile-footer-label">Collection</span>
        </Link>

        {/* Search */}
        <Link 
          to="/search" 
          className={`mobile-footer-item ${isActive('/search') ? 'active' : ''}`}
        >
          <span className="mobile-footer-icon">
            <SearchIcon />
          </span>
          <span className="mobile-footer-label">Search</span>
        </Link>

        {/* Upload */}
        <Link 
          to="/upload" 
          className={`mobile-footer-item ${isActive('/upload') ? 'active' : ''}`}
        >
          <span className="mobile-footer-icon">
            <CameraIcon />
          </span>
          <span className="mobile-footer-label">Upload</span>
        </Link>

        {/* More */}
        <Link 
          to="/more" 
          className={`mobile-footer-item ${isActive('/more') ? 'active' : ''}`}
        >
          <span className="mobile-footer-icon">
            <DotsIcon />
          </span>
          <span className="mobile-footer-label">More</span>
        </Link>

        {/* Profile */}
        <Link 
          to="/profile" 
          className={`mobile-footer-item ${isActive('/profile') ? 'active' : ''}`}
        >
          <span className="mobile-footer-icon">
            <ProfileIcon />
          </span>
          <span className="mobile-footer-label">Profile</span>
        </Link>
      </div>
    </nav>
  );
};

export default MobileFooter;
