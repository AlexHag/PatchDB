import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { StandardPage } from '../components/PageLayout';
import { UserCard } from '../components/common/UserCard';
import { SearchFilters, FilterInput, UniversitySelector } from '../components/common/SearchFilters';
import { NoUsersFoundState, StartSearchingState } from '../components/EmptyState';
import { LoadingSpinner, LoadingButton } from '../components/Loading';
import { ErrorAlert } from '../components/Alert';
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

  const hasActiveFilters = !!(searchFilters.username || searchFilters.universityCode);

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
    <StandardPage
      title="👥 Search Users"
      subtitle="Find and connect with other patch collectors"
      actions={loading ? <LoadingSpinner size="sm" /> : undefined}
    >

      {/* Search Filters */}
      <SearchFilters
        isExpanded={isFiltersExpanded}
        onToggle={() => setIsFiltersExpanded(!isFiltersExpanded)}
        hasActiveFilters={hasActiveFilters}
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
        loading={loading}
      >
        <div className="row g-3">
          <FilterInput
            label="Username"
            id="searchUsername"
            placeholder="Search by username..."
            value={searchFilters.username || ''}
            onChange={(value) => setSearchFilters(prev => ({ ...prev, username: value }))}
          />
          
          <UniversitySelector
            universities={universities}
            selectedCode={searchFilters.universityCode || ''}
            onSelect={(code) => setSearchFilters(prev => ({ ...prev, universityCode: code }))}
          />
        </div>
      </SearchFilters>

      {/* Search Results Count */}
      {hasSearched && (
        <div className="mb-3">
          <small className="text-muted">
            {users.length === 0 ? 'No users found' : `Found ${users.length} user${users.length !== 1 ? 's' : ''}`}
          </small>
        </div>
      )}

      {/* Error Message */}
      {error && <ErrorAlert message={error} />}

      {/* Search Results */}
      {hasSearched ? (
        <>
          {users.length === 0 ? (
            <NoUsersFoundState />
          ) : (
            <>
              {/* User Results Grid */}
              <div className="row g-3 mb-4">
                {users.map((user: PublicUserResponse) => (
                  <div key={user.id} className="col-12 col-md-6 col-lg-4">
                    <UserCard
                      user={user}
                      onCardClick={handleCardClick}
                      onFollowClick={handleFollowClick}
                      followLoading={followLoading === user.id}
                    />
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {canLoadMore && (
                <div className="text-center mb-4">
                  <LoadingButton
                    className="btn btn-dark"
                    onClick={handleLoadMore}
                    loading={loading}
                    loadingText="Loading..."
                  >
                    Load More Users
                  </LoadingButton>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <StartSearchingState />
      )}

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
                <LoadingButton
                  className="btn btn-danger"
                  onClick={handleUnfollow}
                  loading={followLoading === showUnfollowModal.user.id}
                  loadingText="Unfollowing..."
                >
                  Unfollow
                </LoadingButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </StandardPage>
  );
};

export default SearchUsers;
