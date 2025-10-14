import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { useAuth } from '../components/hooks/useAuth';
import { getUserById, getUserPatchesById, followUser, unfollowUser } from '../api/patchdb';
import type { PublicUserResponse, GetUserPatchesResponse, UserPatchModel } from '../api/types';

const PublicProfile: React.FC = () => {
  // Inline styles for profile picture responsiveness
  const profilePictureStyles = `
    .profile-picture-container {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;
      background: linear-gradient(45deg, #405de6, #5851db, #833ab4, #c13584, #e1306c, #fd1d1d);
      padding: 2px;
    }
    @media (min-width: 576px) {
      .profile-picture-container {
        width: 100px;
        height: 100px;
      }
    }
    @media (min-width: 768px) {
      .profile-picture-container {
        width: 120px;
        height: 120px;
      }
    }
    .profile-picture-inner {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      overflow: hidden;
      background-color: white;
    }
  `;

  // Add styles to head
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = profilePictureStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  const { userId } = useParams<{ userId: string }>();
  const { requireAuth, userId: currentUserId } = useAuth();
  const [user, setUser] = useState<PublicUserResponse | null>(null);
  const [userPatches, setUserPatches] = useState<GetUserPatchesResponse>({ patches: [], unmatchesPatches: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followLoading, setFollowLoading] = useState(false);
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);

  useEffect(() => {
    requireAuth();
    if (userId) {
      loadUserProfile();
    }
  }, [userId, requireAuth]);

  const loadUserProfile = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError('');
      
      // Load user info and patches in parallel
      const [userData, patchesData] = await Promise.all([
        getUserById(userId),
        getUserPatchesById(userId)
      ]);
      
      setUser(userData);
      setUserPatches(patchesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'Admin': return 'danger';
      case 'Moderator': return 'warning';
      case 'PatchMaker': return 'info';
      default: return 'secondary';
    }
  };

  const handleFollowClick = async () => {
    if (!userId || !user) return;

    if (user.isFollowing) {
      setShowUnfollowModal(true);
    } else {
      await handleFollow();
    }
  };

  const handleFollow = async () => {
    if (!userId || !user) return;

    try {
      setFollowLoading(true);
      const updatedUser = await followUser(userId);
      setUser(updatedUser);
    } catch (err) {
      console.error('Error following user:', err);
      // You could add a toast notification here
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!userId || !user) return;

    try {
      setFollowLoading(true);
      const updatedUser = await unfollowUser(userId);
      setUser(updatedUser);
      setShowUnfollowModal(false);
    } catch (err) {
      console.error('Error unfollowing user:', err);
      // You could add a toast notification here
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="bg-light min-vh-100">
          <div className="container-fluid p-3">
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !user) {
    return (
      <>
        <Navigation />
        <div className="bg-light min-vh-100">
          <div className="container-fluid p-3">
            <div className="row justify-content-center">
              <div className="col-12 col-md-8 col-lg-6">
                <div className="alert alert-danger text-center">
                  <h4>😕 Profile Not Found</h4>
                  <p className="mb-0">{error || 'This user profile could not be found.'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="bg-light min-vh-100">
        <div className="container-fluid p-3">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8 col-xl-6">
              {/* Profile Header Card - Instagram Style */}
              <div className="card shadow-sm mb-4" style={{ border: 'none' }}>
                <div className="card-body p-4">
                  <div className="row align-items-center">
                    {/* Profile Picture Column - Instagram Style - Fixed for mobile */}
                    <div className="col-auto text-center mb-3 mb-sm-0">
                      <div className="position-relative">
                        {/* Instagram-style circular profile picture - Responsive sizing */}
                        <div className="profile-picture-container">
                          <div className="profile-picture-inner">
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
                    </div>

                    {/* Profile Info Column - Instagram Style - Mobile responsive */}
                    <div className="col ps-3 ps-sm-4">
                      {/* Username and Role */}
                      <div className="d-flex align-items-center flex-wrap mb-2 mb-md-3">
                        <h1 className="h5 h-sm-4 h-md-3 mb-0 me-2 me-md-3 fw-light">{user.username}</h1>
                        {user.role && user.role !== 'User' && (
                          <span className={`badge bg-${getRoleBadgeColor(user.role)} d-inline-block`} style={{ fontSize: '0.7rem' }}>
                            {user.role}
                          </span>
                        )}
                      </div>

                      {/* Stats Row - Instagram Style */}
                      <div className="d-flex gap-3 gap-md-4 mb-2 mb-md-3">
                        <div>
                          <div className="fw-bold h6 h-md-5 mb-0">{userPatches.patches.length}</div>
                          <div className="text-muted" style={{ fontSize: '0.8rem' }}>patches</div>
                        </div>
                        <Link 
                          to={`/user/${userId}/followers-following`} 
                          className="text-decoration-none text-dark"
                          style={{ cursor: 'pointer' }}
                        >
                          <div>
                            <div className="fw-bold h6 h-md-5 mb-0">{user.followersCount}</div>
                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>followers</div>
                          </div>
                        </Link>
                        <Link 
                          to={`/user/${userId}/followers-following`} 
                          className="text-decoration-none text-dark"
                          style={{ cursor: 'pointer' }}
                        >
                          <div>
                            <div className="fw-bold h6 h-md-5 mb-0">{user.followingCount}</div>
                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>following</div>
                          </div>
                        </Link>
                      </div>

                      {/* Bio Section - Mobile responsive */}
                      {user.bio && (
                        <div className="mb-2 mb-md-3">
                          <p className="mb-0" style={{ lineHeight: '1.4', fontSize: '0.85rem' }}>
                            {user.bio}
                          </p>
                        </div>
                      )}

                      {/* University Info - Mobile responsive */}
                      {user.university?.name && (
                        <div className="d-flex align-items-center mb-1 mb-md-2">
                          {user.university?.logoUrl && (
                            <img 
                              src={user.university.logoUrl}
                              alt={`${user.university.name} logo`}
                              style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                              className="me-1 me-md-2"
                            />
                          )}
                          <div>
                            <div className="fw-semibold text-primary" style={{ fontSize: '0.8rem' }}>{user.university.name}</div>
                            {user.universityProgram && (
                              <small className="text-muted d-none d-md-block">{user.universityProgram}</small>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Member Since - Mobile responsive */}
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                        📅 Member since {new Date(user.created).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Button - Edit Profile or Follow/Unfollow */}
                  <div className="mt-3 pt-3 border-top px-3">
                    {currentUserId === userId ? (
                      <Link 
                        to="/profile" 
                        className="btn btn-outline-primary w-100"
                        style={{ minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        ✏️ Edit Profile
                      </Link>
                    ) : (
                      <button 
                        onClick={handleFollowClick}
                        disabled={followLoading}
                        className={`btn w-100 ${user.isFollowing ? 'btn-outline-secondary' : 'btn-primary'}`}
                        style={{ minHeight: '44px' }}
                      >
                        {followLoading ? (
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

              {/* Patches Grid Header */}
              <div className="d-flex align-items-center mb-3">
                <div className="border-top flex-grow-1"></div>
                <h2 className="h5 mb-0 mx-3 text-muted">
                  🧩 PATCHES
                </h2>
                <div className="border-top flex-grow-1"></div>
              </div>

              {/* Patches Collection - Dashboard Style */}
              {userPatches.patches.length === 0 ? (
                <div className="text-center py-5">
                  <div className="text-muted mb-3" style={{ fontSize: '3rem' }}>🎒</div>
                  <h3 className="h5 text-muted mb-2">No patches yet</h3>
                  <p className="text-muted small mb-0">
                    {user.username} hasn't collected any patches yet.
                  </p>
                </div>
              ) : (
                <div className="row g-2 g-md-3">
                  {userPatches.patches.map((patch: UserPatchModel) => (
                    <div key={patch.userPatchId} className="col-6 mb-3">
                      <div className="card h-100 patch-collection-card">
                        <div className="card-body p-0">
                          <div className="row g-0">
                            {/* Patch Image */}
                            <div className="col-12">
                              <Link 
                                to={`/patch/${patch.matchingPatch.patchNumber}`}
                                className="d-block text-decoration-none"
                              >
                                <div className="position-relative patch-image-container" style={{ aspectRatio: '4/3', minHeight: '140px' }}>
                                  <img 
                                    src={patch.matchingPatch.imageUrl} 
                                    alt={patch.matchingPatch.name || `Patch #${patch.matchingPatch.patchNumber}`} 
                                    loading="lazy"
                                    className="w-100 h-100 object-fit-cover rounded-top-3"
                                  />
                                  <div className="patch-overlay rounded-top-3">
                                    <div className="patch-overlay-text">
                                      <div className="small">View Details</div>
                                      <div className="small text-primary">→</div>
                                    </div>
                                  </div>
                                  
                                  {/* Favorite Badge */}
                                  {patch.isFavorite && (
                                    <div className="position-absolute top-0 end-0 m-2">
                                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="text-warning">
                                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                                      </svg>
                                    </div>
                                  )}
                                </div>
                              </Link>
                            </div>
                            
                            {/* Patch Details */}
                            <div className="col-12">
                              <div className="p-3">
                                {/* Header */}
                                <div className="mb-3">
                                  <h3 className="h6 mb-2" style={{color: '#2c3e50', fontSize: '0.9rem'}}>
                                    <Link 
                                      to={`/patch/${patch.matchingPatch.patchNumber}`}
                                      className="text-decoration-none"
                                      style={{color: 'inherit'}}
                                    >
                                      {patch.matchingPatch.name || `Patch #${patch.matchingPatch.patchNumber}`}
                                    </Link>
                                  </h3>
                                  
                                  {patch.matchingPatch.description && (
                                    <p className="text-muted mb-2 d-none d-md-block" style={{ 
                                      fontSize: '0.75rem',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden'
                                    }}>
                                      {patch.matchingPatch.description}
                                    </p>
                                  )}
                                </div>
                                
                                {/* University and Maker Info */}
                                {patch.matchingPatch.university && (
                                  <div className="d-flex align-items-center mb-2">
                                    {patch.matchingPatch.university.logoUrl && (
                                      <img 
                                        src={patch.matchingPatch.university.logoUrl} 
                                        alt={`${patch.matchingPatch.university.name} logo`}
                                        className="me-1 me-md-2 rounded"
                                        style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                                        loading="lazy"
                                      />
                                    )}
                                    <div>
                                      <div className="fw-semibold" style={{color: '#2c3e50', fontSize: '0.75rem'}}>
                                        {patch.matchingPatch.university.name}
                                      </div>
                                      {patch.matchingPatch.universitySection && (
                                        <div className="text-muted d-none d-md-block" style={{fontSize: '0.7rem'}}>
                                          {patch.matchingPatch.universitySection}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Additional Details */}
                                <div className="text-muted" style={{fontSize: '0.7rem'}}>
                                  {patch.matchingPatch.patchMaker && (
                                    <div className="mb-1 d-none d-md-block">
                                      <strong>Maker:</strong> {patch.matchingPatch.patchMaker}
                                    </div>
                                  )}
                                  <div className="mb-1">
                                    <strong>Acquired:</strong> {new Date(patch.aquiredAt).toLocaleDateString()}
                                  </div>
                                  {patch.matchingPatch.releaseDate && (
                                    <div className="mb-1 d-none d-md-block">
                                      <strong>Released:</strong> {new Date(patch.matchingPatch.releaseDate).getFullYear()}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Action Button */}
                                <div className="mt-2 mt-md-3 pt-2 border-top">
                                  <Link 
                                    to={`/patch/${patch.matchingPatch.patchNumber}`}
                                    className="btn btn-outline-dark btn-sm w-100"
                                    style={{fontSize: '0.75rem'}}
                                  >
                                    <span className="d-none d-md-inline">View Details </span>View →
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination or Load More could go here if needed */}
            </div>
          </div>
        </div>
      </div>

      {/* Unfollow Confirmation Modal */}
      {showUnfollowModal && (
        <div className="modal show d-block" tabIndex={-1} style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Unfollow {user?.username}?</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowUnfollowModal(false)}
                  disabled={followLoading}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to unfollow {user?.username}? You won't see their updates in your feed anymore.</p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowUnfollowModal(false)}
                  disabled={followLoading}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleUnfollow}
                  disabled={followLoading}
                >
                  {followLoading ? (
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
    </>
  );
};

export default PublicProfile;
