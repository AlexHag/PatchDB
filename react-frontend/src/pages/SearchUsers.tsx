import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { useAuth } from '../components/hooks/useAuth';
import { searchUsers, getUniversities } from '../api/patchdb';
import type { UserResponse, SearchUserRequest, UniversityModel } from '../api/types';

const SearchUsers: React.FC = () => {
  const { requireAuth } = useAuth();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [universities, setUniversities] = useState<UniversityModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [canLoadMore, setCanLoadMore] = useState(false);
  const itemsPerPage = 20;

  // Search filters
  const [searchFilters, setSearchFilters] = useState<SearchUserRequest>({
    username: '',
    universityCode: '',
    skip: 0,
    take: itemsPerPage
  });
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  // Load universities for dropdown
  useEffect(() => {
    const loadUniversities = async () => {
      try {
        const universitiesData = await getUniversities();
        setUniversities(universitiesData);
      } catch (error) {
        console.error('Error loading universities:', error);
      }
    };
    loadUniversities();
  }, []);

  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'Admin': return 'danger';
      case 'Moderator': return 'warning';
      case 'PatchMaker': return 'info';
      default: return 'secondary';
    }
  };

  const loadUsers = useCallback(async (loadMore: boolean = false) => {
    try {
      setLoading(true);
      setError('');
      
      const skip = loadMore ? users.length : 0;
      const searchRequest = {
        ...searchFilters,
        skip,
        take: itemsPerPage
      };
      
      const data = await searchUsers(searchRequest);
      
      if (loadMore) {
        setUsers(prev => [...prev, ...data]);
      } else {
        setUsers(data);
      }
      
      // Check if we can load more (if we got full page, there might be more)
      setCanLoadMore(data.length === itemsPerPage);
      setHasSearched(true);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [searchFilters, users.length]);

  const handleSearch = () => {
    setUsers([]);
    setHasSearched(false);
    loadUsers(false);
  };

  const handleLoadMore = () => {
    loadUsers(true);
  };

  const handleClearFilters = () => {
    setSearchFilters({
      username: '',
      universityCode: '',
      skip: 0,
      take: itemsPerPage
    });
    setUsers([]);
    setHasSearched(false);
    setCanLoadMore(false);
  };

  const hasActiveFilters = searchFilters.username || searchFilters.universityCode;

  return (
    <div className="bg-light min-vh-100">
      <Navigation />

      <div className="container mt-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <h2 className="h3 mb-1" style={{background: 'linear-gradient(135deg, #2c3e50, #e67e22)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              👥 Search Users
            </h2>
            <p className="text-muted mb-3">Find and connect with other patch collectors</p>
            
            {/* Stats */}
            <div className="d-flex align-items-center mb-3">
              {/* {hasSearched && (
                <div className="stat-card me-3">
                  <div className="stat-number">{users.length}</div>
                  <div className="stat-label">Users Found</div>
                </div>
              )} */}
              {loading && (
                <div className="spinner-border spinner-border-sm text-dark" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Filters Toggle */}
        <div className="card mb-4">
          <div className="card-header">
            <button 
              className="btn btn-link w-100 text-start p-0 text-decoration-none d-flex justify-content-between align-items-center"
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              style={{color: '#2c3e50'}}
            >
              <h5 className="mb-0">🔍 Search Filters {hasActiveFilters && <span className="badge bg-dark ms-2">Active</span>}</h5>
              <svg 
                className={`transition ${isFiltersExpanded ? 'rotate-180' : ''}`}
                width="20" 
                height="20" 
                fill="currentColor" 
                viewBox="0 0 16 16"
                style={{transition: 'transform 0.2s ease'}}
              >
                <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
          </div>
          
          {/* Collapsible Filter Content */}
          <div className={`collapse ${isFiltersExpanded ? 'show' : ''}`} style={{transition: 'all 0.3s ease'}}>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="searchUsername" className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="searchUsername"
                    placeholder="Search by username..."
                    value={searchFilters.username || ''}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                
                <div className="col-md-6">
                  <label htmlFor="searchUniversity" className="form-label">University</label>
                  <select
                    className="form-select"
                    id="searchUniversity"
                    value={searchFilters.universityCode || ''}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, universityCode: e.target.value }))}
                  >
                    <option value="">All Universities</option>
                    {universities.map(university => (
                      <option key={university.code} value={university.code}>
                        {university.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-3 d-flex gap-2">
                <button 
                  className="btn btn-dark"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
                
                {hasActiveFilters && (
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={handleClearFilters}
                    disabled={loading}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger mb-4">
            {error}
          </div>
        )}

        {/* Search Results */}
        {hasSearched ? (
          <>
            {users.length === 0 ? (
              <div className="text-center py-5">
                <div className="text-muted mb-3" style={{ fontSize: '3rem' }}>👥</div>
                <h3 className="h5 text-muted mb-2">No users found</h3>
                <p className="text-muted small mb-0">
                  Try adjusting your search filters to find more users.
                </p>
              </div>
            ) : (
              <>
                {/* User Results Grid */}
                <div className="row g-3 mb-4">
                  {users.map((user: UserResponse) => (
                    <div key={user.id} className="col-12 col-md-6 col-lg-4">
                      <div className="card h-100">
                        <div className="card-body">
                          <div className="d-flex align-items-center mb-3">
                            {/* Profile Picture */}
                            <div className="me-3">
                              <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                background: 'linear-gradient(45deg, #405de6, #5851db, #833ab4, #c13584, #e1306c, #fd1d1d)',
                                padding: '2px'
                              }}>
                                <div style={{
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: '50%',
                                  overflow: 'hidden',
                                  backgroundColor: 'white'
                                }}>
                                  <img 
                                    src={user.profilePictureUrl || '/no_profile_picture.png'} 
                                    alt={`${user.username}'s profile`} 
                                    className="w-100 h-100"
                                    style={{ objectFit: 'cover' }}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = '/no_profile_picture.png';
                                    }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* User Info */}
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center flex-wrap mb-1">
                                <h6 className="mb-0 me-2">{user.username}</h6>
                                {user.role && user.role !== 'User' && (
                                  <span className={`badge bg-${getRoleBadgeColor(user.role)}`} style={{ fontSize: '0.6rem' }}>
                                    {user.role}
                                  </span>
                                )}
                              </div>
                              
                              {user.universityName && (
                                <div className="d-flex align-items-center mb-1">
                                  {user.universityLogoUrl && (
                                    <img 
                                      src={user.universityLogoUrl}
                                      alt={`${user.universityName} logo`}
                                      style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                                      className="me-1"
                                    />
                                  )}
                                  <small className="text-muted">{user.universityName}</small>
                                </div>
                              )}
                              
                              <small className="text-muted">
                                📅 Joined {new Date(user.created).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short' 
                                })}
                              </small>
                            </div>
                          </div>

                          {/* Bio */}
                          {user.bio && (
                            <p className="text-muted small mb-3" style={{ 
                              fontSize: '0.8rem',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {user.bio}
                            </p>
                          )}

                          {/* View Profile Button */}
                          <Link 
                            to={`/user/${user.id}`}
                            className="btn btn-outline-primary btn-sm w-100"
                          >
                            👁️ View Profile
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                {canLoadMore && (
                  <div className="text-center mb-4">
                    <button 
                      className="btn btn-dark"
                      onClick={handleLoadMore}
                      disabled={loading}
                    >
                      {loading ? 'Loading...' : 'Load More Users'}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          // Initial state - show helpful message
          <div className="text-center py-5">
            <div className="text-muted mb-3" style={{ fontSize: '3rem' }}>🔍</div>
            <h3 className="h5 text-muted mb-2">Start searching for users</h3>
            <p className="text-muted small mb-0">
              Use the search filters above to find other patch collectors.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchUsers;
