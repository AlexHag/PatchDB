import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/hooks/useAuth';
import Navigation from '../components/Navigation';
import { addPatchToGroup, createPatchGroup, formatImagePath } from '../api/patchdb';
import type { UploadResult, MatchResult, UngroupedMatch } from '../api/types';

interface SelectedMatch {
  type: 'group' | 'ungrouped';
  groupId?: number;
  groupName?: string;
  patchId?: number;
}

const Matches: React.FC = () => {
  const { userId, requireAuth } = useAuth();
  const navigate = useNavigate();
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<SelectedMatch | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newPatchName, setNewPatchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const effectiveUserId = requireAuth();
    if (!effectiveUserId) return;

    // Get upload result from session storage
    const resultData = sessionStorage.getItem('uploadResult');
    if (!resultData) {
      showError('No upload data found. Please upload a patch first.');
      setTimeout(() => navigate('/upload'), 2000);
      return;
    }

    try {
      const result = JSON.parse(resultData) as UploadResult;
      setUploadResult(result);
    } catch (error) {
      showError('Invalid upload data. Please try uploading again.');
      setTimeout(() => navigate('/upload'), 2000);
    }
  }, [requireAuth, navigate]);

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const selectGroupMatch = (groupId: number, groupName: string) => {
    setSelectedMatch({ type: 'group', groupId, groupName });
  };

  const selectUngroupedMatch = (patchId: number) => {
    setSelectedMatch({ type: 'ungrouped', patchId });
  };

  const handleAddToSelectedGroup = async () => {
    if (!selectedMatch || !uploadResult || !userId) {
      showError('Please select a match first.');
      return;
    }

    if (selectedMatch.type === 'ungrouped') {
      showError('Grouping with ungrouped patches requires creating a new group name.');
      return;
    }

    try {
      setLoading(true);
      await addPatchToGroup(userId, uploadResult.patch.id, selectedMatch.groupId!);
      showSuccess(`Patch added to "${selectedMatch.groupName}" group!`);

      // Clear session storage and redirect
      sessionStorage.removeItem('uploadResult');
      setTimeout(() => navigate('/dashboard'), 1500);

    } catch (error) {
      showError('Failed to add patch: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewGroup = async () => {
    if (!uploadResult || !userId) return;
    
    const groupName = newGroupName.trim();
    if (!groupName) {
      showError('Please enter a name for the new patch.');
      return;
    }

    try {
      setLoading(true);
      await createPatchGroup(userId, uploadResult.patch.id, groupName);
      showSuccess(`New patch "${groupName}" created successfully!`);

      // Clear session storage and redirect
      sessionStorage.removeItem('uploadResult');
      setTimeout(() => navigate('/dashboard'), 1500);

    } catch (error) {
      showError('Failed to create new patch: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewPatch = async () => {
    if (!uploadResult || !userId) return;
    
    const patchName = newPatchName.trim();
    if (!patchName) {
      showError('Please enter a name for the patch.');
      return;
    }

    try {
      setLoading(true);
      await createPatchGroup(userId, uploadResult.patch.id, patchName);
      showSuccess(`Patch "${patchName}" added to your collection!`);

      // Clear session storage and redirect
      sessionStorage.removeItem('uploadResult');
      setTimeout(() => navigate('/dashboard'), 1500);

    } catch (error) {
      showError('Failed to add patch: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (!uploadResult) {
    return (
      <div className="bg-light min-vh-100">
        <Navigation showDashboardLink />
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

  const hasMatches = uploadResult.matches && uploadResult.matches.length > 0;
  const hasUngroupedMatches = uploadResult.ungrouped_matches && uploadResult.ungrouped_matches.length > 0;
  const hasAnyMatches = hasMatches || hasUngroupedMatches;

  return (
    <div className="bg-light min-vh-100">
      <Navigation showDashboardLink />

      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            
            {/* Your Uploaded Patch */}
            <div className="card mb-4">
              <div className="card-header">
                <h2 className="h5 mb-0">Your Uploaded Patch</h2>
              </div>
              <div className="card-body text-center">
                <img 
                  src={formatImagePath(uploadResult.patch.path)}
                  className="image-preview mb-3" 
                  style={{ maxHeight: '200px' }}
                  alt="Uploaded patch"
                />
              </div>
            </div>

            {/* No Matches Found */}
            {!hasAnyMatches && (
              <div className="card">
                <div className="card-body text-center py-5">
                  <svg className="mb-3 text-muted" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                  </svg>
                  <h3 className="h5">You don't own this patch yet!</h3>
                  <p className="text-muted mb-4">This appears to be a new patch for your collection.</p>
                  
                  <div className="row justify-content-center">
                    <div className="col-12 col-sm-6">
                      <div className="mb-3">
                        <label htmlFor="newPatchName" className="form-label">Patch Name</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="newPatchName" 
                          placeholder="Enter the name of this patch" 
                          required
                          value={newPatchName}
                          onChange={(e) => setNewPatchName(e.target.value)}
                        />
                      </div>
                      <button 
                        className="btn btn-dark w-100" 
                        onClick={handleCreateNewPatch}
                        disabled={loading}
                      >
                        {loading && (
                          <span className="spinner-border spinner-border-sm me-2"></span>
                        )}
                        Add to Collection
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Matches Found */}
            {hasAnyMatches && (
              <div>
                <div className="card mb-4">
                  <div className="card-header">
                    <h2 className="h5 mb-0">Possible Matches</h2>
                    <small className="text-muted">We found similar patches in your collection. Select the correct match or create a new patch.</small>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      {/* Display grouped matches */}
                      {hasMatches && uploadResult.matches!.map((match: MatchResult) => {
                        const confidence = Math.round(match.score * 100);
                        const isFavorite = match.is_favorite === 1;
                        const isSelected = selectedMatch?.type === 'group' && selectedMatch?.groupId === match.group_id;
                        
                        return (
                          <div key={`group-${match.group_id}`} className="col-12 col-sm-6 col-lg-4 mb-3">
                            <div 
                              className={`match-item card cursor-pointer ${isSelected ? 'selected' : ''}`}
                              onClick={() => selectGroupMatch(match.group_id, match.group_name)}
                            >
                              <div className="patch-item">
                                <img 
                                  src={formatImagePath(match.path)} 
                                  alt={match.group_name} 
                                  className="card-img-top"
                                />
                              </div>
                              <div className="card-body p-3">
                                <div className="d-flex align-items-center mb-1">
                                  <h5 className="card-title h6 mb-0 me-1">{match.group_name}</h5>
                                  {isFavorite && (
                                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16" className="text-warning">
                                      <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                                    </svg>
                                  )}
                                </div>
                                <p className="card-text small text-muted mb-2">{confidence}% match</p>
                                <div className="badge bg-secondary">Grouped Patch</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Display ungrouped matches */}
                      {hasUngroupedMatches && uploadResult.ungrouped_matches!.map((match: UngroupedMatch) => {
                        const confidence = Math.round(match.score * 100);
                        const isSelected = selectedMatch?.type === 'ungrouped' && selectedMatch?.patchId === match.id;
                        
                        return (
                          <div key={`ungrouped-${match.id}`} className="col-12 col-sm-6 col-lg-4 mb-3">
                            <div 
                              className={`match-item card cursor-pointer ${isSelected ? 'selected' : ''}`}
                              onClick={() => selectUngroupedMatch(match.id)}
                            >
                              <div className="patch-item">
                                <img 
                                  src={formatImagePath(match.path)} 
                                  alt="Ungrouped patch" 
                                  className="card-img-top"
                                />
                              </div>
                              <div className="card-body p-3">
                                <h5 className="card-title h6 mb-1">Ungrouped Patch</h5>
                                <p className="card-text small text-muted mb-2">{confidence}% match</p>
                                <div className="badge bg-warning text-dark">Ungrouped</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="card">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-12 col-md-6 mb-3">
                        <h4 className="h6">Found a match?</h4>
                        <button 
                          className="btn btn-dark w-100" 
                          onClick={handleAddToSelectedGroup}
                          disabled={!selectedMatch || loading}
                        >
                          {loading && (
                            <span className="spinner-border spinner-border-sm me-2"></span>
                          )}
                          {selectedMatch?.type === 'ungrouped' ? 'Group with Selected Patch' : 'Add to Selected Group'}
                        </button>
                      </div>
                      <div className="col-12 col-md-6">
                        <h4 className="h6">This is not the same patch?</h4>
                        <div className="mb-2">
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Enter new patch name" 
                            required
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                          />
                        </div>
                        <button 
                          className="btn btn-outline-dark w-100" 
                          onClick={handleCreateNewGroup}
                          disabled={loading}
                        >
                          {loading && (
                            <span className="spinner-border spinner-border-sm me-2"></span>
                          )}
                          Create New Patch
                        </button>
                      </div>
                    </div>
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
        </div>
      </div>
    </div>
  );
};

export default Matches;
