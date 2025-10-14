import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { useAuth } from '../components/hooks/useAuth';
import { getUserFollowers, getUserFollowing, followUser, unfollowUser, getUserById } from '../api/patchdb';
import type { PublicUserResponse, PaginationResponse } from '../api/types';

type ViewMode = 'followers' | 'following';

const FollowersFollowing: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { requireAuth, userId: currentUserId } = useAuth();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<PublicUserResponse | null>(null);
  const [users, setUsers] = useState<PublicUserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('followers');
  const [canLoadMore, setCanLoadMore] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [followLoading, setFollowLoading] = useState<string | null>(null);
  const [showUnfollowModal, setShowUnfollowModal] = useState<{show: boolean, user: PublicUserResponse | null}>({show: false, user: null});
  const itemsPerPage = 20;

  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  // Load the user profile data
  useEffect(() => {
    const loadUser = async () => {
      if (!userId) return;
      
      try {
        const userData = await getUserById(userId);
        setUser(userData);
      } catch (error) {
        console.error('Error loading user:', error);
        setError('Failed to load user profile');
      }
    };
    
    loadUser();
  }, [userId]);

  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'Admin': return 'danger';
      case 'Moderator': return 'warning';
      case 'PatchMaker': return 'info';
      default: return 'secondary';
    }
  };

  const loadUsers = useCallback(async (loadMore: boolean = false, isToggle: boolean = false) => {
    if (!userId) return;
    
    try {
      // Only show loading for initial load and load more, not for toggles
      if (!isToggle) {
        setLoading(true);
      }
      setError('');
      
      const skip = loadMore ? users.length : 0;
      let data: PaginationResponse<PublicUserResponse>;
      
      if (viewMode === 'followers') {
        data = await getUserFollowers(userId, skip, itemsPerPage);
      } else {
        data = await getUserFollowing(userId, skip, itemsPerPage);
      }
      
      if (loadMore) {
        setUsers(prev => [...prev, ...(data.items || [])]);
      } else {
        setUsers(data.items || []);
      }
      
      // Check if we can load more
      setCanLoadMore((data.items || []).length === itemsPerPage);
      
      if (initialLoad) {
        setInitialLoad(false);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      if (!isToggle) {
        setLoading(false);
      }
    }
  }, [userId, viewMode, users.length, initialLoad]);

  // Load users when view mode changes or component mounts
  useEffect(() => {
    if (userId) {
      setUsers([]);
      // Pass isToggle flag to prevent loading animation when toggling
      loadUsers(false, !initialLoad);
    }
  }, [userId, viewMode]);

  const handleLoadMore = () => {
    loadUsers(true);
  };

  const handleViewModeChange = (newMode: ViewMode) => {
    if (newMode !== viewMode) {
      setViewMode(newMode);
    }
  };

  const handleFollowClick = async (user: PublicUserResponse, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    
    if (user.isFollowing) {
      setShowUnfollowModal({show: true, user});
    } else {
      await handleFollow(user.id);
    }
  };

  const handleFollow = async (followUserId: string) => {
    try {
      setFollowLoading(followUserId);
      const updatedUser = await followUser(followUserId);
      
      // Update the user in the list
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === followUserId ? updatedUser : u)
      );
    } catch (err) {
      console.error('Error following user:', err);
    } finally {
      setFollowLoading(null);
    }
  };

  const handleUnfollow = async () => {
    const userToUnfollow = showUnfollowModal.user;
    if (!userToUnfollow) return;

    try {
      setFollowLoading(userToUnfollow.id);
      const updatedUser = await unfollowUser(userToUnfollow.id);
      
      // Update the user in the list
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === userToUnfollow.id ? updatedUser : u)
      );
      
      setShowUnfollowModal({show: false, user: null});
    } catch (err) {
      console.error('Error unfollowing user:', err);
    } finally {
      setFollowLoading(null);
    }
  };

  const handleCardClick = (clickedUserId: string) => {
    navigate(`/user/${clickedUserId}`);
  };

  const handleBackClick = () => {
    navigate(`/user/${userId}`);
  };

  if (!userId) {
    return (
      <div className="bg-light min-vh-100">
        <Navigation />
        <div className="container mt-4">
          <div className="alert alert-danger">Invalid user ID</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <Navigation />

      <div className="container mt-4">
        {/* Header */}
        <div className="row mb-3">
          <div className="col-12">
            <div className="d-flex align-items-center mb-2">
              <button 
                className="btn btn-link p-0 me-3 text-dark"
                onClick={handleBackClick}
                style={{ fontSize: '1.5rem' }}
              >
                ← 
              </button>
              <div>
                <h2 className="h3 mb-1" style={{background: 'linear-gradient(135deg, #2c3e50, #e67e22)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                  {user ? `@${user.username}` : 'Loading...'}
                </h2>
                <p className="text-muted mb-0">
                  {viewMode === 'followers' ? 'Followers' : 'Following'}
                </p>
              </div>
            </div>
            
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

        {/* View Mode Toggle */}
        <div className="card mb-3">
          <div className="card-body p-2">
            <div className="btn-group w-100" role="group">
              <button 
                type="button" 
                className={`btn ${viewMode === 'followers' ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => handleViewModeChange('followers')}
                style={{ transition: 'none' }}
              >
                👥 Followers {user && `(${user.followersCount})`}
              </button>
              <button 
                type="button" 
                className={`btn ${viewMode === 'following' ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => handleViewModeChange('following')}
                style={{ transition: 'none' }}
              >
                👤 Following {user && `(${user.followingCount})`}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger mb-4">
            {error}
          </div>
        )}

        {/* Users List */}
        {users.length === 0 && !loading ? (
          <div className="text-center py-5">
            <div className="text-muted mb-3" style={{ fontSize: '3rem' }}>
              {viewMode === 'followers' ? '👥' : '👤'}
            </div>
            <h3 className="h5 text-muted mb-2">
              {viewMode === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
            </h3>
            <p className="text-muted small mb-0">
              {viewMode === 'followers' 
                ? 'When people follow this user, they will appear here.' 
                : 'When this user follows people, they will appear here.'}
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
                            {user.id === currentUserId && (
                                <span className="badge bg-secondary me-1" style={{ fontSize: '0.6rem' }}>
                                You
                                </span>
                            )}
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

                      {user.id !== currentUserId && (
                        <button 
                          onClick={(e) => handleFollowClick(user, e)}
                          disabled={followLoading === user.id}
                          className={`btn w-100 ${user.isFollowing ? 'btn-outline-secondary' : 'btn-primary'}`}
                          style={{ minHeight: '40px', borderRadius: '6px' }}
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
                      )}
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

export default FollowersFollowing;
