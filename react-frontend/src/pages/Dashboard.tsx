import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/hooks/useAuth';
import Navigation from '../components/Navigation';
import { 
  getUserPatches
} from '../api/patchdb';
import type { 
  GetUserPatchesResponse, 
  UserPatchModel,
  UserPatchUploadModel
} from '../api/types';

const Dashboard: React.FC = () => {
  const { userId, requireAuth } = useAuth();
  const navigate = useNavigate();
  const [userPatches, setUserPatches] = useState<GetUserPatchesResponse>({ patches: [], unmatchesPatches: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await getUserPatches();
      setUserPatches(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError('Failed to load dashboard data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadDashboard();
    }
  }, [userId, loadDashboard]);

  // Calculate stats
  const stats = useMemo(() => {
    const uniquePatches = userPatches.patches.length;
    const totalPatches = userPatches.patches.reduce((total, patch) => total + patch.uploads.length, 0);
    const unmatchesCount = userPatches.unmatchesPatches.length;

    return { uniquePatches, totalPatches, ungroupedCount: unmatchesCount };
  }, [userPatches]);

  if (loading && userPatches.patches.length === 0) {
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
            <h2 className="h3 mb-1" style={{background: 'linear-gradient(135deg, #2c3e50, #e67e22)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              🎒 Your Patch Collection
            </h2>
            <p className="text-muted mb-4">Track your university adventures through the patches you've collected!</p>
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
        </div>

        {/* Quick Actions */}
        <div className="row mb-4">
          <div className="col-12">
            <h3 className="h4 mb-3" style={{color: '#2c3e50'}}>
              ⚡ Quick Actions
            </h3>
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
                <h4 className="h6 mb-2" style={{color: '#e67e22'}}>📸 Upload a new Patch?</h4>
                <p className="text-muted mb-3 flex-grow-1">Take a photo or upload an image of your new patch!!</p>
                <button 
                  className="btn btn-dark" 
                  onClick={() => navigate('/upload')}
                >
                  🚀 Upload Patch
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {userPatches.patches.length === 0 && userPatches.unmatchesPatches.length === 0 && (
          <div className="text-center py-5">
            <svg className="mb-3 text-muted" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
              <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
              <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093L6.52 10.724l-2.005-2.005A.5.5 0 0 0 4.229 8.7l-3.226 3.226A1 1 0 0 1 1.002 13V3a1 1 0 0 1 1-1h12z"/>
            </svg>
            <h3 className="h4" style={{color: '#e67e22'}}>🌟 Your Collection Awaits!</h3>
            <p className="text-muted mb-3">Start building your patch collection by uploading your first patch!</p>
            <button 
              className="btn btn-dark" 
              onClick={() => navigate('/upload')}
            >
              🎯 Add Your First Patch!
            </button>
          </div>
        )}

        {/* New API Patches */}
        {userPatches.patches.length > 0 && userPatches.patches.map((patch: UserPatchModel, index) => (
          <div key={patch.userPatchId} className="row mb-4 patch-group">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                  <h2 className="h5 mb-0 me-2">
                    {patch.matchingPatch.name || `Patch #${patch.matchingPatch.patchNumber}`}
                  </h2>
                  {patch.isFavorite && (
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="text-warning">
                      <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                    </svg>
                  )}
                </div>
                <div className="d-flex align-items-center">
                  <span className="badge bg-secondary me-2">
                    You own {patch.uploads.length} of these
                  </span>
                </div>
              </div>
              <div className="patch-grid">
                <div className="patch-item">
                  <img 
                    src={patch.matchingPatch.imageUrl} 
                    alt={patch.matchingPatch.name || `Patch #${patch.matchingPatch.patchNumber}`} 
                    loading="lazy" 
                  />
                  <div className="patch-overlay">
                    <div className="patch-overlay-text">
                      <div className="small">Official Patch Image</div>
                    </div>
                  </div>
                </div>
                {patch.uploads.map((upload: UserPatchUploadModel) => (
                  <div key={upload.userPatchUploadId} className="patch-item">
                    <img 
                      src={upload.imageUrl} 
                      alt="Your upload" 
                      loading="lazy"
                    />
                    <div className="patch-overlay">
                      <div className="patch-overlay-text">
                        <div className="small">Your Upload</div>
                        <div className="small">{new Date(upload.created).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {patch.matchingPatch.patchMaker && (
                <div className="mt-2">
                  <small className="text-muted">
                    Maker: {patch.matchingPatch.patchMaker}
                    {patch.matchingPatch.university && ` • ${patch.matchingPatch.university}`}
                    {patch.matchingPatch.universitySection && ` • ${patch.matchingPatch.universitySection}`}
                  </small>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Unmatched Uploads */}
        {/* {userPatches.unmatchesPatches.length > 0 && (
          <div className="row mb-4">
            <div className="col-12">
              <h2 className="h5" style={{color: '#e67e22'}}>🤔 Mystery Patches</h2>
              <p className="text-muted small mb-3">
                These uploads are still being identified! They might be new patches or need a closer look from our team.
              </p>
              <div className="patch-grid">
                {userPatches.unmatchesPatches.map((upload: UserPatchUploadModel) => (
                  <div key={upload.userPatchUploadId} className="patch-item">
                    <img 
                      src={upload.imageUrl} 
                      alt="Unmatched upload" 
                      loading="lazy"
                    />
                    <div className="patch-overlay">
                      <div className="patch-overlay-text">
                        <div className="small text-warning">Unmatched</div>
                        <div className="small">{new Date(upload.created).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )} */}

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
