import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/hooks/useAuth';
import { StandardPage } from '../components/PageLayout';
import { PatchCard } from '../components/PatchCard';
import { NoCollectionState } from '../components/EmptyState';
import { LoadingPage, LoadingOverlay } from '../components/Loading';
import { ErrorAlert, SuccessAlert } from '../components/Alert';
import { ImageIcon } from '../components/Icons';
import { 
  getUserPatches
} from '../api/patchdb';
import type { 
  GetUserPatchesResponse, 
  UserPatchModel
} from '../api/types';

const Dashboard: React.FC = () => {
  const { userId } = useAuth();
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
    return <LoadingPage message="Loading your patch collection..." />;
  }

  return (
    <StandardPage
      title="🎒 Your Patch Collection"
      subtitle="Track your university adventures through the patches you've collected!"
    >
      {/* User Stats */}
      <div className="row mb-4">
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
                <ImageIcon size={48} className="mb-2" />
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
        <NoCollectionState onUpload={() => navigate('/upload')} />
      )}

      {/* Patch Collection */}
      {userPatches.patches.length > 0 && (
        <div className="row g-2 g-md-3">
          {userPatches.patches.map((patch: UserPatchModel) => (
            <div key={patch.userPatchId} className="col-6 mb-3">
              <PatchCard patch={patch} type="user" />
            </div>
          ))}
        </div>
      )}

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
      {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}
      {success && <SuccessAlert message={success} onDismiss={() => setSuccess('')} />}

      {/* Loading Overlay */}
      <LoadingOverlay show={loading} message="Loading..." />
    </StandardPage>
  );
};

export default Dashboard;
