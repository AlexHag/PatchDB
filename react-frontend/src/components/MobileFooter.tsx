import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../components/hooks/useAuth';
import { HomeIcon, SearchIcon, CameraIcon, DotsIcon, ProfileIcon } from './Icons';

interface MobileFooterProps {}

const MobileFooter: React.FC<MobileFooterProps> = () => {
  const location = useLocation();

  const { userId } = useAuth();

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
          <span className="mobile-footer-icon">
            <HomeIcon className="footer-svg-icon" />
          </span>
          <span className="mobile-footer-label">Collection</span>
        </Link>

        {/* Search */}
        <Link 
          to="/search" 
          className={`mobile-footer-item ${isActive('/search') ? 'active' : ''}`}
        >
          <span className="mobile-footer-icon">
            <SearchIcon className="footer-svg-icon" />
          </span>
          <span className="mobile-footer-label">Search</span>
        </Link>

        {/* Upload */}
        <Link 
          to="/upload" 
          className={`mobile-footer-item ${isActive('/upload') ? 'active' : ''}`}
        >
          <span className="mobile-footer-icon">
            <CameraIcon className="footer-svg-icon" />
          </span>
          <span className="mobile-footer-label">Upload</span>
        </Link>

        {/* More */}
        <Link 
          to="/more" 
          className={`mobile-footer-item ${isActive('/more') ? 'active' : ''}`}
        >
          <span className="mobile-footer-icon">
            <DotsIcon className="footer-svg-icon" />
          </span>
          <span className="mobile-footer-label">More</span>
        </Link>

        {/* Profile */}
        <Link 
          to={`/user/${userId}`}  
          className={`mobile-footer-item ${isActive(`/user/${userId}`) || isActive("/profile") ? 'active' : ''}`}
        >
          <span className="mobile-footer-icon">
            <ProfileIcon className="footer-svg-icon" />
          </span>
          <span className="mobile-footer-label">Profile</span>
        </Link>
      </div>
    </nav>
  );
};

export default MobileFooter;
