import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

interface NavigationProps {}

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
            🧵 PatchDB
          </Link>

          {/* Right side: Greeting + Hamburger */}
          <div className="d-flex align-items-center">
            {username && (
              <span className="navbar-text me-2 me-sm-3" style={{color: '#f39c12', fontSize: '0.85rem'}}>
                👋 Hey, <span className="d-none d-sm-inline">Hey, </span><strong>{username}</strong>!
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
                <span className="nav-icon">🏠</span>
                Dashboard
              </Link>
              
              <Link 
                to="/upload" 
                className="mobile-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="nav-icon">📸</span>
                Upload Patch
              </Link>
              
              <Link 
                to="/browse-patches" 
                className="mobile-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="nav-icon">🧩</span>
                Browse Patches
              </Link>
              
              {/* Submit Patch - Only for Admin, Moderator, PatchMaker */}
              {user && ['Admin', 'Moderator', 'PatchMaker'].includes(user.role) && (
                <Link 
                  to="/submit-patch" 
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="nav-icon">✨</span>
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
                  <span className="nav-icon">🔍</span>
                  Review Queue
                </Link>
              )}
              
              <Link 
                to="/profile" 
                className="mobile-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="nav-icon">👤</span>
                Profile
              </Link>
              
              <button 
                className="mobile-nav-link logout-btn"
                onClick={handleLogout}
              >
                <span className="nav-icon">👋</span>
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
