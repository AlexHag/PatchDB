import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

const Search: React.FC = () => {
  const navigate = useNavigate();

  const handleBrowsePatches = () => {
    navigate('/browse-patches');
  };

  const handleSearchUsers = () => {
    navigate('/search-users');
  };

  return (
    <>
      <Navigation />
      <div className="container-fluid" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-8">
              <div className="text-center mb-4">
                <h1 className="display-4 mb-3" style={{ color: '#2c3e50', fontWeight: 'bold' }}>
                  🔍 Search
                </h1>
                <p className="lead text-muted">
                  What would you like to search for?
                </p>
              </div>

              <div className="row g-2 g-md-4">
                {/* Browse Patches Card */}
                <div className="col-6">
                  <div 
                    className="card h-100 shadow-sm border-0" 
                    style={{ 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      borderRadius: '12px'
                    }}
                    onClick={handleBrowsePatches}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div className="card-body text-center py-3 py-md-5">
                      <div className="mb-2 mb-md-4">
                        <span 
                          className="display-4 d-md-none" 
                          style={{ fontSize: '2.5rem' }}
                        >
                          🧩
                        </span>
                        <span 
                          className="display-1 d-none d-md-inline" 
                          style={{ fontSize: '4rem' }}
                        >
                          🧩
                        </span>
                      </div>
                      <h4 className="card-title mb-2 mb-md-3 d-md-none" style={{ color: '#2c3e50', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        Browse Patches
                      </h4>
                      <h3 className="card-title mb-3 d-none d-md-block" style={{ color: '#2c3e50', fontWeight: 'bold' }}>
                        Browse Patches
                      </h3>
                      <p className="card-text text-muted mb-2 mb-md-4 d-none d-sm-block" style={{ fontSize: '0.9rem' }}>
                        Explore our collection of patches from universities around the world.
                      </p>
                      <p className="card-text text-muted mb-4 d-none d-md-block">
                        Explore our collection of patches from universities around the world. 
                        Filter by university, category, or search by name.
                      </p>
                      <div className="d-grid">
                        <button 
                          className="btn btn-outline-primary btn-sm d-md-none"
                          style={{
                            borderRadius: '8px',
                            fontWeight: '500',
                            borderWidth: '2px',
                            fontSize: '0.8rem'
                          }}
                        >
                          Browse →
                        </button>
                        <button 
                          className="btn btn-outline-primary btn-lg d-none d-md-block"
                          style={{
                            borderRadius: '10px',
                            fontWeight: '500',
                            borderWidth: '2px'
                          }}
                        >
                          Browse Patches →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search Users Card */}
                <div className="col-6">
                  <div 
                    className="card h-100 shadow-sm border-0" 
                    style={{ 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      borderRadius: '12px'
                    }}
                    onClick={handleSearchUsers}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div className="card-body text-center py-3 py-md-5">
                      <div className="mb-2 mb-md-4">
                        <span 
                          className="display-4 d-md-none" 
                          style={{ fontSize: '2.5rem' }}
                        >
                          👥
                        </span>
                        <span 
                          className="display-1 d-none d-md-inline" 
                          style={{ fontSize: '4rem' }}
                        >
                          👥
                        </span>
                      </div>
                      <h4 className="card-title mb-2 mb-md-3 d-md-none" style={{ color: '#2c3e50', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        Search Users
                      </h4>
                      <h3 className="card-title mb-3 d-none d-md-block" style={{ color: '#2c3e50', fontWeight: 'bold' }}>
                        Search Users
                      </h3>
                      <p className="card-text text-muted mb-2 mb-md-4 d-none d-sm-block" style={{ fontSize: '0.9rem' }}>
                        Find other patch collectors by username or university.
                      </p>
                      <p className="card-text text-muted mb-4 d-none d-md-block">
                        Find other patch collectors by username or university. 
                        Connect with fellow enthusiasts and see their collections.
                      </p>
                      <div className="d-grid">
                        <button 
                          className="btn btn-outline-success btn-sm d-md-none"
                          style={{
                            borderRadius: '8px',
                            fontWeight: '500',
                            borderWidth: '2px',
                            fontSize: '0.8rem'
                          }}
                        >
                          Search →
                        </button>
                        <button 
                          className="btn btn-outline-success btn-lg d-none d-md-block"
                          style={{
                            borderRadius: '10px',
                            fontWeight: '500',
                            borderWidth: '2px'
                          }}
                        >
                          Search Users →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional info section */}
              <div className="text-center mt-5">
                <div className="card border-0" style={{ backgroundColor: 'transparent' }}>
                  <div className="card-body">
                    <p className="text-muted mb-0">
                      <small>
                        💡 <strong>Tip:</strong> Use the search features to discover new patches and connect with collectors from your university or others around the world.
                      </small>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Search;
