import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

interface NavigationProps {}

// SVG Icons
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="nav-svg-icon">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="nav-svg-icon">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="nav-svg-icon">
    <circle cx="12" cy="12" r="3.2"/>
    <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
  </svg>
);

const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="nav-svg-icon">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

const ReviewIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="nav-svg-icon">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="nav-svg-icon">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="nav-svg-icon">
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
  </svg>
);

const Navigation: React.FC<NavigationProps> = () => {
  const { username, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Close menu when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && !target.closest('.mobile-nav-menu') && !target.closest('.hamburger-btn')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
  };

  return (
    <>
      <nav className="navbar navbar-dark bg-dark mobile-first-nav">
        <div className="container">
          {/* Left side: Brand */}
          <Link className="navbar-brand" to="/dashboard">
            PatchDB
          </Link>

          {/* Right side: Greeting + Hamburger */}
          <div className="d-flex align-items-center">
            {username && (
              <span className="navbar-text me-2 me-sm-3" style={{color: '#f39c12', fontSize: '0.85rem'}}>
                Hey, <strong>{username}</strong>!
              </span>
            )}

            
            {/* Hamburger Button */}
            <button 
              className="hamburger-btn"
              onClick={toggleMenu}
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
            >
              <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
              <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
              <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu Overlay */}
      {isMenuOpen && (
        <div className="mobile-nav-overlay">
          <div className="mobile-nav-menu">
            {/* Navigation Links */}
            <div className="mobile-nav-links">
              <Link 
                to="/dashboard" 
                className="mobile-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="nav-icon">
                  <HomeIcon />
                </span>
                Collection
              </Link>

              <Link 
                to="/search" 
                className="mobile-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="nav-icon">
                  <SearchIcon />
                </span>
                Search
              </Link>
              
              <Link 
                to="/upload" 
                className="mobile-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="nav-icon">
                  <CameraIcon />
                </span>
                Upload
              </Link>
              
              {/* Submit Patch - Only for Admin, Moderator, PatchMaker */}
              {user && ['Admin', 'Moderator', 'PatchMaker'].includes(user.role) && (
                <Link 
                  to="/submit-patch" 
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="nav-icon">
                    <PlusIcon />
                  </span>
                  Submit New Patch
                </Link>
              )}
              
              {/* Review Queue - Only for Admin, Moderator */}
              {user && ['Admin', 'Moderator'].includes(user.role) && (
                <Link 
                  to="/review-queue" 
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="nav-icon">
                    <ReviewIcon />
                  </span>
                  Review Queue
                </Link>
              )}

              <Link 
                to="/profile" 
                className="mobile-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="nav-icon">
                  <ProfileIcon />
                </span>
                Profile
              </Link>
              
              <button 
                className="mobile-nav-link logout-btn"
                onClick={handleLogout}
              >
                <span className="nav-icon">
                  <LogoutIcon />
                </span>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
