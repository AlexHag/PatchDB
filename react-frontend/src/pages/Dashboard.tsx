import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/hooks/useAuth';
import Navigation from '../components/Navigation';
import { 
  getUserPatches, 
  deletePatch, 
  deletePatchGroup, 
  addGroupToFavorites, 
  removeGroupFromFavorites,
  addPatchToGroup,
  createPatchGroup,
  formatImagePath
} from '../api/patchdb';
import type { UserPatchesResponse, PatchGroup, UngroupedPatch } from '../api/types';

const Dashboard: React.FC = () => {
  const { userId, requireAuth } = useAuth();
  const navigate = useNavigate();
  const [allPatches, setAllPatches] = useState<UserPatchesResponse>({ patches: [], ungrouped_patches: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPatchId, setCurrentPatchId] = useState<number | null>(null);
  const [selectedPatchForGrouping, setSelectedPatchForGrouping] = useState<number | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [showPatchModal, setShowPatchModal] = useState(false);
  const [showAddToGroupModal, setShowAddToGroupModal] = useState(false);
  const [modalData, setModalData] = useState({ title: '', imagePath: '', subtitle: '' });

  useEffect(() => {
    const effectiveUserId = requireAuth();
    if (effectiveUserId) {
      loadDashboard();
    }
  }, [requireAuth]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await getUserPatches(userId!);
      setAllPatches(data);
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError('Failed to load dashboard data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 5000);
  };

  // Calculate stats
  const stats = useMemo(() => {
    const uniquePatches = allPatches.patches.length + allPatches.ungrouped_patches.length;
    const totalPatches = allPatches.patches.reduce((total, group) => total + group.images.length, 0) + 
                       allPatches.ungrouped_patches.length;
    const ungroupedCount = allPatches.ungrouped_patches.length;

    return { uniquePatches, totalPatches, ungroupedCount };
  }, [allPatches]);

  // Filter and search logic
  const filteredData = useMemo(() => {
    const hasSearchTerm = searchTerm.trim() !== '';
    
    // Filter grouped patches
    const filteredGroupedPatches = allPatches.patches.filter(group => {
      const groupName = group.name.toLowerCase();
      const isFavorite = group.is_favorite === 1;
      const matchesSearch = !hasSearchTerm || groupName.includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || 
                         filterType === 'grouped' || 
                         (filterType === 'favorites' && isFavorite);
      return matchesSearch && matchesFilter;
    });

    // Filter ungrouped patches
    const showUngroupedPatches = !hasSearchTerm && (filterType === 'all' || filterType === 'ungrouped');

    return {
      groupedPatches: filteredGroupedPatches,
      ungroupedPatches: showUngroupedPatches ? allPatches.ungrouped_patches : [],
      hasResults: filteredGroupedPatches.length > 0 || (showUngroupedPatches && allPatches.ungrouped_patches.length > 0),
      isSearchActive: hasSearchTerm
    };
  }, [allPatches, searchTerm, filterType]);

  const handlePatchDetail = (imagePath: string, title: string, subtitle: string, patchId: number) => {
    setCurrentPatchId(patchId);
    setModalData({ title, imagePath, subtitle });
    setShowPatchModal(true);
  };

  const handleAddToGroupModal = (patchId: number, patchPath: string) => {
    setSelectedPatchForGrouping(patchId);
    setModalData({ ...modalData, imagePath: patchPath });
    setNewGroupName('');
    setShowAddToGroupModal(true);
  };

  const handleDeletePatch = async () => {
    if (!currentPatchId) {
      showError('No patch selected for deletion');
      return;
    }

    if (!confirm('Are you sure you want to delete this patch? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await deletePatch(userId!, currentPatchId);
      setShowPatchModal(false);
      showSuccess('Patch deleted successfully');
      await loadDashboard();
    } catch (error) {
      console.error('Error deleting patch:', error);
      showError('Failed to delete patch: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: number, groupName: string) => {
    if (!confirm(`Are you sure you want to delete the group "${groupName}" and all patches in it? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await deletePatchGroup(userId!, groupId);
      showSuccess(`Group "${groupName}" deleted successfully`);
      await loadDashboard();
    } catch (error) {
      console.error('Error deleting group:', error);
      showError('Failed to delete group: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (groupId: number, groupName: string, currentlyFavorite: boolean) => {
    try {
      if (currentlyFavorite) {
        await removeGroupFromFavorites(userId!, groupId);
        showSuccess(`"${groupName}" removed from favorites`);
      } else {
        await addGroupToFavorites(userId!, groupId);
        showSuccess(`"${groupName}" added to favorites`);
      }
      await loadDashboard();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showError('Failed to update favorite status: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleAddToExistingGroup = async (groupId: number, groupName: string) => {
    if (!selectedPatchForGrouping) return;

    try {
      setLoading(true);
      await addPatchToGroup(userId!, selectedPatchForGrouping, groupId);
      setShowAddToGroupModal(false);
      showSuccess(`Patch added to "${groupName}" successfully`);
      await loadDashboard();
    } catch (error) {
      console.error('Error adding patch to group:', error);
      showError('Failed to add patch to group: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewGroup = async () => {
    if (!selectedPatchForGrouping || !newGroupName.trim()) {
      showError('Please enter a group name');
      return;
    }

    try {
      setLoading(true);
      await createPatchGroup(userId!, selectedPatchForGrouping, newGroupName.trim());
      setShowAddToGroupModal(false);
      showSuccess(`New group "${newGroupName.trim()}" created successfully`);
      await loadDashboard();
    } catch (error) {
      console.error('Error creating new group:', error);
      showError('Failed to create new group: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilterType('all');
  };

  if (loading && allPatches.patches.length === 0) {
    return (
      <div className="bg-light min-vh-100">
        <Navigation />
        <div className="container mt-4">
          <div className="text-center py-5">
            <div className="spinner-border text-dark" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <Navigation />

      <div className="container mt-4">
        {/* User Stats */}
        <div className="row mb-4">
          <div className="col-12">
            <h2 className="h4 mb-3">Your Collection</h2>
          </div>
          <div className="col-6 col-md-4 mb-3">
            <div className="stat-card">
              <div className="stat-number">{stats.uniquePatches}</div>
              <div className="stat-label">Unique Patches</div>
            </div>
          </div>
          <div className="col-6 col-md-4 mb-3">
            <div className="stat-card">
              <div className="stat-number">{stats.totalPatches}</div>
              <div className="stat-label">Total Patches</div>
            </div>
          </div>
          {stats.ungroupedCount > 0 && (
            <div className="col-12 col-md-4 mb-3">
              <div className="stat-card">
                <div className="stat-number">{stats.ungroupedCount}</div>
                <div className="stat-label">Ungrouped</div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="row mb-4">
          <div className="col-12">
            <h3 className="h5 mb-3">Quick Actions</h3>
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3 mx-auto">
            <div className="card h-100">
              <div className="card-body d-flex flex-column text-center">
                <div className="mb-3">
                  <svg className="mb-2" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                    <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093L6.52 10.724l-2.005-2.005A.5.5 0 0 0 4.229 8.7l-3.226 3.226A1 1 0 0 1 1.002 13V3a1 1 0 0 1 1-1h12z"/>
                  </svg>
                </div>
                <h4 className="h6 mb-2">Add New Patch</h4>
                <p className="text-muted mb-3 flex-grow-1">Take a photo or upload an image of your new patch</p>
                <button 
                  className="btn btn-dark" 
                  onClick={() => navigate('/upload')}
                >
                  Upload Patch
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search/Filter */}
        {(allPatches.patches.length > 0 || allPatches.ungrouped_patches.length > 0) && (
          <div className="row mb-4">
            <div className="col-12">
              <h3 className="h5 mb-3">Your Patch Collection</h3>
            </div>
            <div className="col-12 col-md-6">
              <div className="input-group">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search grouped patches..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button 
                  className="btn btn-outline-secondary" 
                  type="button" 
                  onClick={clearSearch}
                  title="Clear search"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                  </svg>
                </button>
                <span className="input-group-text">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                  </svg>
                </span>
              </div>
            </div>
            <div className="col-12 col-md-6 mt-2 mt-md-0">
              <select 
                className="form-select" 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Patches</option>
                <option value="grouped">Grouped Only</option>
                <option value="ungrouped">Ungrouped Only</option>
                <option value="favorites">Favorites Only</option>
              </select>
            </div>
          </div>
        )}

        {/* Empty State */}
        {allPatches.patches.length === 0 && allPatches.ungrouped_patches.length === 0 && (
          <div className="text-center py-5">
            <svg className="mb-3 text-muted" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
              <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
              <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093L6.52 10.724l-2.005-2.005A.5.5 0 0 0 4.229 8.7l-3.226 3.226A1 1 0 0 1 1.002 13V3a1 1 0 0 1 1-1h12z"/>
            </svg>
            <h3 className="h5">No Patches Yet</h3>
            <p className="text-muted mb-3">Start building your patch collection by uploading your first patch!</p>
            <button 
              className="btn btn-dark" 
              onClick={() => navigate('/upload')}
            >
              Add Your First Patch
            </button>
          </div>
        )}

        {/* No Results Message (for search) */}
        {!filteredData.hasResults && filteredData.isSearchActive && (allPatches.patches.length > 0 || allPatches.ungrouped_patches.length > 0) && (
          <div className="text-center py-5">
            <svg className="mb-3 text-muted" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
            <h3 className="h6">No patches match your search</h3>
            <p className="text-muted small">
              {allPatches.ungrouped_patches.length > 0 
                ? 'Note: Ungrouped patches are hidden during search. Try clearing your search to see them.'
                : 'Try adjusting your search term or filter'}
            </p>
          </div>
        )}

        {/* Grouped Patches */}
        {filteredData.groupedPatches.map(group => (
          <div key={group.id} className="row mb-4 patch-group">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                  <h2 className="h5 mb-0 me-2">{group.name}</h2>
                  <button 
                    className={`btn btn-link p-0 me-2 ${group.is_favorite === 1 ? 'text-warning' : 'text-muted'}`}
                    onClick={() => toggleFavorite(group.id, group.name, group.is_favorite === 1)}
                    title={group.is_favorite === 1 ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      {group.is_favorite === 1 ? (
                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                      ) : (
                        <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.576-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z"/>
                      )}
                    </svg>
                  </button>
                </div>
                <div className="d-flex align-items-center">
                  <span className="badge bg-secondary me-2">
                    {group.images.length} image{group.images.length > 1 ? 's' : ''}
                  </span>
                  <button 
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDeleteGroup(group.id, group.name)}
                    title="Delete group"
                  >
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                      <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="patch-grid">
                {group.images.map((image, index) => (
                  <div 
                    key={image.id}
                    className="patch-item cursor-pointer"
                    onClick={() => handlePatchDetail(
                      image.path, 
                      group.name, 
                      `Group ${index + 1} of ${group.images.length}`, 
                      image.id
                    )}
                  >
                    <img src={formatImagePath(image.path)} alt={group.name} loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Ungrouped Patches */}
        {filteredData.ungroupedPatches.length > 0 && (
          <div className="row mb-3">
            <div className="col-12">
              <h2 className="h5">Ungrouped Patches</h2>
              <p className="text-muted small">These patches haven't been organized into groups yet.</p>
            </div>
            <div className="col-12">
              <div className="patch-grid mb-4">
                {filteredData.ungroupedPatches.map(patch => (
                  <div 
                    key={patch.id}
                    className="patch-item cursor-pointer ungrouped-patch"
                    onClick={() => handleAddToGroupModal(patch.id, patch.path)}
                  >
                    <img src={formatImagePath(patch.path)} alt="Ungrouped patch" loading="lazy" />
                    <div className="patch-overlay">
                      <div className="patch-overlay-text">
                        <svg width="24" height="24" fill="white" viewBox="0 0 16 16">
                          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                        </svg>
                        <div className="small">Add to Group</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}
        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {success}
            <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
          </div>
        )}
      </div>

      {/* Patch Detail Modal */}
      {showPatchModal && (
        <div className="modal fade show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modalData.title}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowPatchModal(false)}
                ></button>
              </div>
              <div className="modal-body text-center">
                <img 
                  src={formatImagePath(modalData.imagePath)} 
                  className="img-fluid rounded" 
                  style={{ maxHeight: '400px' }} 
                  alt={modalData.title}
                />
                <div className="mt-3">
                  <p className="text-muted mb-0">{modalData.subtitle}</p>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowPatchModal(false)}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={handleDeletePatch}
                  disabled={loading}
                >
                  {loading && <span className="spinner-border spinner-border-sm me-1"></span>}
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="me-1">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                  </svg>
                  Delete Patch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add to Group Modal */}
      {showAddToGroupModal && (
        <div className="modal fade show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Patch to Group</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowAddToGroupModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-4">
                    <img 
                      src={formatImagePath(modalData.imagePath)} 
                      className="img-fluid rounded" 
                      style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }}
                      alt="Selected patch"
                    />
                  </div>
                  <div className="col-8">
                    <h6>Choose a group for this patch:</h6>
                    <div className="mb-3">
                      {allPatches.patches.length === 0 ? (
                        <p className="text-muted small mb-0">No existing groups. Create a new one below.</p>
                      ) : (
                        allPatches.patches.map(group => (
                          <div 
                            key={group.id}
                            className="d-flex align-items-center mb-2 p-2 border rounded cursor-pointer existing-group-item"
                            onClick={() => handleAddToExistingGroup(group.id, group.name)}
                          >
                            <img 
                              src={formatImagePath(group.images[0].path)} 
                              alt={group.name}
                              className="me-2 rounded" 
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                            />
                            <div>
                              <div className="fw-semibold">{group.name}</div>
                              <small className="text-muted">{group.images.length} image{group.images.length > 1 ? 's' : ''}</small>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="border-top pt-3">
                      <h6>Or create a new group:</h6>
                      <div className="input-group">
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Enter group name"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleCreateNewGroup()}
                        />
                        <button 
                          className="btn btn-outline-dark" 
                          type="button" 
                          onClick={handleCreateNewGroup}
                          disabled={loading || !newGroupName.trim()}
                        >
                          {loading && <span className="spinner-border spinner-border-sm me-1"></span>}
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowAddToGroupModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
