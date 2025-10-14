import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { useAuth } from '../components/hooks/useAuth';
import { searchUsers, getUniversities, followUser, unfollowUser } from '../api/patchdb';
import type { PublicUserResponse, SearchUserRequest, UniversityModel } from '../api/types';

const SearchUsers: React.FC = () => {
  const { requireAuth } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<PublicUserResponse[]>([]);
  const [universities, setUniversities] = useState<UniversityModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [canLoadMore, setCanLoadMore] = useState(false);
  const [followLoading, setFollowLoading] = useState<string | null>(null);
  const [showUnfollowModal, setShowUnfollowModal] = useState<{show: boolean, user: PublicUserResponse | null}>({show: false, user: null});
  const itemsPerPage = 20;

  // Search filters
  const [searchFilters, setSearchFilters] = useState<SearchUserRequest>({
    username: '',
    universityCode: '',
    skip: 0,
    take: itemsPerPage
  });
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);

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

  const handleFollowClick = async (user: PublicUserResponse, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    
    if (user.isFollowing) {
      setShowUnfollowModal({show: true, user});
    } else {
      await handleFollow(user.id);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      setFollowLoading(userId);
      const updatedUser = await followUser(userId);
      
      // Update the user in the list
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === userId ? updatedUser : u)
      );
    } catch (err) {
      console.error('Error following user:', err);
    } finally {
      setFollowLoading(null);
    }
  };

  const handleUnfollow = async () => {
    const user = showUnfollowModal.user;
    if (!user) return;

    try {
      setFollowLoading(user.id);
      const updatedUser = await unfollowUser(user.id);
      
      // Update the user in the list
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === user.id ? updatedUser : u)
      );
      
      setShowUnfollowModal({show: false, user: null});
    } catch (err) {
      console.error('Error unfollowing user:', err);
    } finally {
      setFollowLoading(null);
    }
  };

  const handleCardClick = (userId: string) => {
    navigate(`/user/${userId}`);
  };

  return (
    <div className="bg-light min-vh-100">
      <Navigation />

      <div className="container mt-4">
        {/* Header */}
        <div className="row mb-2">
          <div className="col-12">
            <h2 className="h3 mb-1" style={{background: 'linear-gradient(135deg, #2c3e50, #e67e22)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              👥 Search Users
            </h2>
            <p className="text-muted mb-3">Find and connect with other patch collectors</p>
            
             {/* Loading indicator */}
             <div className="d-flex align-items-center mb-2">
               {loading && (
                 <div className="spinner-border spinner-border-sm text-dark" role="status">
                   <span className="visually-hidden">Loading...</span>
                 </div>
               )}
             </div>
          </div>
        </div>

         {/* Search Filters Toggle */}
         <div className="card mb-3">
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

         {/* Search Results Count */}
         {hasSearched && (
           <div className="mb-3">
             <small className="text-muted">
               {users.length === 0 ? 'No users found' : `Found ${users.length} user${users.length !== 1 ? 's' : ''}`}
             </small>
           </div>
         )}

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
                  {users.map((user: PublicUserResponse) => (
                    <div key={user.id} className="col-12 col-md-6 col-lg-4">
                      <div 
                        className="card h-100" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleCardClick(user.id)}
                      >
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
                              
                              {user.university?.name && (
                                <div className="d-flex align-items-center mb-1">
                                  {user.university?.logoUrl && (
                                    <img 
                                      src={user.university.logoUrl}
                                      alt={`${user.university.name} logo`}
                                      style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                                      className="me-1"
                                    />
                                  )}
                                  <small className="text-muted">{user.university.name}</small>
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

                          {/* Follow/Unfollow Button */}
                          <button 
                            onClick={(e) => handleFollowClick(user, e)}
                            disabled={followLoading === user.id}
                            className={`btn btn-sm w-100 ${user.isFollowing ? 'btn-outline-secondary' : 'btn-primary'}`}
                          >
                            {followLoading === user.id ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                {user.isFollowing ? 'Unfollowing...' : 'Following...'}
                              </>
                            ) : (
                              <>
                                {user.isFollowing ? (
                                  <>
                                    <span className="me-1">✓</span>
                                    Following
                                  </>
                                ) : (
                                  <>
                                    <span className="me-1">➕</span>
                                    Follow
                                  </>
                                )}
                              </>
                            )}
                          </button>
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

      {/* Unfollow Confirmation Modal */}
      {showUnfollowModal.show && showUnfollowModal.user && (
        <div className="modal show d-block" tabIndex={-1} style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Unfollow {showUnfollowModal.user.username}?</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowUnfollowModal({show: false, user: null})}
                  disabled={followLoading === showUnfollowModal.user.id}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to unfollow {showUnfollowModal.user.username}? You won't see their updates in your feed anymore.</p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowUnfollowModal({show: false, user: null})}
                  disabled={followLoading === showUnfollowModal.user.id}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleUnfollow}
                  disabled={followLoading === showUnfollowModal.user.id}
                >
                  {followLoading === showUnfollowModal.user.id ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Unfollowing...
                    </>
                  ) : (
                    'Unfollow'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchUsers;
