import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/hooks/useAuth';
import Navigation from '../components/Navigation';
import { confirmPatchMatch } from '../api/patchdb';
import type { 
  PatchUploadResponse, 
  OwnedMatchingPatchesModel, 
  PatchResponse,
  UserPatchUploadModel
} from '../api/types';

interface SelectedMatch {
  type: 'owned' | 'new';
  patchNumber: number;
  patchName?: string;
}

const Matches: React.FC = () => {
  const { requireAuth } = useAuth();
  const navigate = useNavigate();
  const [uploadResult, setUploadResult] = useState<PatchUploadResponse | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<SelectedMatch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    requireAuth();

    // Get upload result from session storage
    const resultData = sessionStorage.getItem('patchUploadResult');
    if (!resultData) {
      showError('No upload data found. Please upload a patch first.');
      setTimeout(() => navigate('/upload'), 2000);
      return;
    }

    try {
      const result = JSON.parse(resultData) as PatchUploadResponse;
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

  const selectOwnedMatch = (patchNumber: number, patchName?: string) => {
    setSelectedMatch({ type: 'owned', patchNumber, patchName });
  };

  const selectNewMatch = (patchNumber: number, patchName?: string) => {
    setSelectedMatch({ type: 'new', patchNumber, patchName });
  };

  const handleConfirmMatch = async () => {
    if (!selectedMatch || !uploadResult) {
      showError('Please select a match first.');
      return;
    }

    try {
      setLoading(true);
      await confirmPatchMatch(uploadResult.upload.userPatchUploadId, selectedMatch.patchNumber);
      
      const patchName = selectedMatch.patchName || `Patch #${selectedMatch.patchNumber}`;
      if (selectedMatch.type === 'owned') {
        showSuccess(`Upload added to your existing "${patchName}" collection!`);
      } else {
        showSuccess(`"${patchName}" patch acquired! Welcome to your collection.`);
      }

      // Clear session storage and redirect
      sessionStorage.removeItem('patchUploadResult');
      setTimeout(() => navigate('/dashboard'), 1500);

    } catch (error) {
      showError('Failed to confirm match: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (!uploadResult) {
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

  const hasOwnedMatches = uploadResult.ownedMatchingPatches && uploadResult.ownedMatchingPatches.length > 0;
  const hasNewMatches = uploadResult.newMatchingPatches && uploadResult.newMatchingPatches.length > 0;
  const hasAnyMatches = hasOwnedMatches || hasNewMatches;

  return (
    <div className="bg-light min-vh-100">
      <Navigation />

      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            
            {/* Your Uploaded Image */}
            <div className="card mb-4">
              <div className="card-header">
                <h2 className="h4 mb-0" style={{background: 'linear-gradient(135deg, #2c3e50, #e67e22)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                  📸 Your Uploaded Patch
                </h2>
              </div>
              <div className="card-body text-center">
                <img 
                  src={uploadResult.upload.imageUrl}
                  className="image-preview mb-3" 
                  style={{ maxHeight: '200px' }}
                  alt="Uploaded image"
                />
                <p className="text-muted small mb-0">Uploaded on {new Date(uploadResult.upload.created).toLocaleString()}</p>
              </div>
            </div>

            {/* No Matches Found */}
            {!hasAnyMatches && (
              <div className="card">
                <div className="card-body text-center py-5">
                  <svg className="mb-3 text-danger" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                  </svg>
                  <h3 className="h4" style={{color: '#e67e22'}}>🤔 Hmm, This One's New to Us!</h3>
                  <p className="text-muted mb-4">
                    We couldn't find this patch in our collection yet! 
                    This might be a brand new patch or perhaps the photo needs a different angle.
                  </p>
                  <p className="text-muted small mb-4">
                    <strong>💡 Pro tip:</strong> Our team is always adding new patches to the database. 
                    If you think this should be included, our moderators will take a look during their next review!
                  </p>
                  <button 
                    className="btn btn-outline-dark" 
                    onClick={() => navigate('/upload')}
                  >
                    🔄 Try Another Photo
                  </button>
                </div>
              </div>
            )}

            {/* Owned Matches */}
            {hasOwnedMatches && (
              <div className="card mb-4">
                <div className="card-header">
                  <h2 className="h4 mb-1" style={{color: '#27ae60'}}>
                    🎉 You Already Have {uploadResult.ownedMatchingPatches!.length === 1 ? 'This One!' : 'These!'}
                  </h2>
                  <small className="text-muted">
                    Awesome! You already have {uploadResult.ownedMatchingPatches![0].uploads.length} photo{uploadResult.ownedMatchingPatches![0].uploads.length > 1 ? 's' : ''} of this patch in your collection.
                  </small>
                </div>
                <div className="card-body">
                  <div className="row">
                    {uploadResult.ownedMatchingPatches!.map((ownedMatch: OwnedMatchingPatchesModel, index) => {
                      const confidence = Math.round(ownedMatch.similarity * 100);
                      const isSelected = selectedMatch?.type === 'owned' && selectedMatch?.patchNumber === ownedMatch.matchingPatch.patchNumber;
                      
                      return (
                        <div key={`owned-${index}`} className="col-12 col-sm-6 col-lg-4 mb-3">
                          <div 
                            className={`match-item card cursor-pointer ${isSelected ? 'selected' : ''}`}
                            onClick={() => selectOwnedMatch(ownedMatch.matchingPatch.patchNumber, ownedMatch.matchingPatch.name)}
                          >
                            <div className="patch-item">
                              <img 
                                src={ownedMatch.matchingPatch.imageUrl} 
                                alt={ownedMatch.matchingPatch.name || `Patch ${ownedMatch.matchingPatch.patchNumber}`}
                                className="card-img-top"
                              />
                            </div>
                            <div className="card-body p-3">
                              <div className="d-flex align-items-center mb-1">
                                <h5 className="card-title h6 mb-0 me-1">
                                  {ownedMatch.matchingPatch.name || `Patch ${ownedMatch.matchingPatch.patchNumber}`}
                                </h5>
                                {ownedMatch.isFavorite && (
                                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16" className="text-warning">
                                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                                  </svg>
                                )}
                              </div>
                              <p className="card-text small text-muted mb-1">{confidence}% match</p>
                              <p className="card-text small text-success mb-2">
                                You have {ownedMatch.uploads.length} upload{ownedMatch.uploads.length > 1 ? 's' : ''}
                              </p>
                              <div className="badge bg-success">You Own This</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* New Matches */}
            {hasNewMatches && (
              <div className="card mb-4">
                <div className="card-header">
                  <h2 className="h4 mb-1" style={{color: '#e67e22'}}>🌟 New Patch Discovered!</h2>
                  <small className="text-muted">
                    This patch isn't in your collection yet. Click it to add it to your collection!
                  </small>
                </div>
                <div className="card-body">
                  <div className="row">
                    {uploadResult.newMatchingPatches!.map((newMatch: PatchResponse, index) => {
                      const confidence = Math.round(newMatch.similarity * 100);
                      const isSelected = selectedMatch?.type === 'new' && selectedMatch?.patchNumber === newMatch.patchNumber;
                      
                      return (
                        <div key={`new-${index}`} className="col-12 col-sm-6 col-lg-4 mb-3">
                          <div 
                            className={`match-item card cursor-pointer ${isSelected ? 'selected' : ''}`}
                            onClick={() => selectNewMatch(newMatch.patchNumber, newMatch.name)}
                          >
                            <div className="patch-item">
                              <img 
                                src={newMatch.imageUrl} 
                                alt={newMatch.name || `Patch ${newMatch.patchNumber}`}
                                className="card-img-top"
                              />
                            </div>
                            <div className="card-body p-3">
                              <h5 className="card-title h6 mb-1">
                                {newMatch.name || `Patch ${newMatch.patchNumber}`}
                              </h5>
                              <p className="card-text small text-muted mb-1">{confidence}% match</p>
                              {newMatch.description && (
                                <p className="card-text small text-muted mb-2">{newMatch.description}</p>
                              )}
                              <div className="badge bg-primary">New Patch</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            {hasAnyMatches && (
              <div className="card">
                <div className="card-body text-center">
                  <h4 className="h5 mb-3" style={{color: '#2c3e50'}}>🎯 Confirm Your Selection!</h4>
                  <button 
                    className="btn btn-dark btn-lg" 
                    onClick={handleConfirmMatch}
                    disabled={!selectedMatch || loading}
                  >
                    {loading && (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    )}
                    {selectedMatch?.type === 'owned' 
                      ? '📚 Add to Collection' 
                      : selectedMatch?.type === 'new' 
                      ? '✨ Acquire This Patch!' 
                      : '👆 Please Select a Match Above'
                    }
                  </button>
                  {selectedMatch && (
                    <p className="text-muted small mt-2 mb-0">
                      🎯 Selected: <strong>{selectedMatch.patchName || `Patch #${selectedMatch.patchNumber}`}</strong>
                    </p>
                  )}
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
