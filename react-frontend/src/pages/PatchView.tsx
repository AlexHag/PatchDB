import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/hooks/useAuth';
import Navigation from '../components/Navigation';
import { getPatchDetail } from '../api/patchdb';
import type { PatchResponse } from '../api/types';

const PatchView: React.FC = () => {
  const { patchNumber } = useParams<{ patchNumber: string }>();
  const { requireAuth, user } = useAuth();
  const navigate = useNavigate();
  const [patch, setPatch] = useState<PatchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  useEffect(() => {
    const loadPatch = async () => {
      if (!patchNumber) {
        setError('No patch number provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        const patchNum = parseInt(patchNumber, 10);
        if (isNaN(patchNum)) {
          setError('Invalid patch number');
          setLoading(false);
          return;
        }

        const data = await getPatchDetail(patchNum);
        setPatch(data);
      } catch (error) {
        console.error('Error loading patch:', error);
        setError('Failed to load patch details: ' + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    loadPatch();
  }, [patchNumber]);

  if (loading) {
    return (
      <div className="bg-light min-vh-100">
        <Navigation />
        <div className="container mt-4">
          <div className="text-center py-5">
            <div className="spinner-border text-dark" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-3">Loading patch details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-light min-vh-100">
        <Navigation />
        <div className="container mt-4">
          <div className="text-center py-5">
            <div className="mb-3">
              <svg width="64" height="64" fill="currentColor" viewBox="0 0 16 16" className="text-danger">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
              </svg>
            </div>
            <h3 className="h4 text-danger mb-3">Error Loading Patch</h3>
            <p className="text-muted mb-4">{error}</p>
            <button 
              className="btn btn-outline-dark" 
              onClick={() => navigate('/dashboard')}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!patch) {
    return (
      <div className="bg-light min-vh-100">
        <Navigation />
        <div className="container mt-4">
          <div className="text-center py-5">
            <h3 className="h4 text-muted">Patch not found</h3>
            <button 
              className="btn btn-outline-dark mt-3" 
              onClick={() => navigate('/dashboard')}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <Navigation />

      <div className="container mt-4">
        {/* Back Button */}
        <div className="row mb-3">
          <div className="col-12">
            <button 
              className="btn btn-outline-dark btn-sm"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Patch Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex align-items-center mb-2">
              <h1 className="h2 mb-0 me-3" style={{color: '#2c3e50'}}>
                {patch.name || `Patch #${patch.patchNumber}`}
              </h1>
              <span className="badge bg-secondary fs-6">#{patch.patchNumber}</span>
            </div>
            {patch.description && (
              <p className="text-muted lead">{patch.description}</p>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="row">
          {/* Patch Image */}
          <div className="col-12 col-lg-6 mb-4">
            <div className="card">
              <div className="card-body p-3">
                <div className="position-relative">
                  <img 
                    src={patch.imageUrl} 
                    alt={patch.name || `Patch #${patch.patchNumber}`}
                    className="img-fluid rounded shadow-sm"
                    style={{ width: '100%', maxHeight: '500px', objectFit: 'contain' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Patch Details */}
          <div className="col-12 col-lg-6 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h3 className="h5 mb-3" style={{color: '#e67e22'}}>📋 Patch Details</h3>
                
                <div className="row g-3">
                  {patch.patchMaker && (
                    <div className="col-12">
                      <div className="d-flex align-items-center">
                        <strong className="text-muted me-2">Maker:</strong>
                        <span>{patch.patchMaker}</span>
                      </div>
                    </div>
                  )}

                  {patch.university && (
                    <div className="col-12">
                      <div className="d-flex align-items-center">
                        <strong className="text-muted me-2">University:</strong>
                        <div className="d-flex align-items-center">
                          <img 
                            src={patch.university.logoUrl} 
                            alt={patch.university.name}
                            className="me-2"
                            style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                          />
                          <span>{patch.university.name} ({patch.university.code})</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {patch.universitySection && (
                    <div className="col-12">
                      <div className="d-flex align-items-center">
                        <strong className="text-muted me-2">Section:</strong>
                        <span>{patch.universitySection}</span>
                      </div>
                    </div>
                  )}

                  {patch.releaseDate && (
                    <div className="col-12">
                      <div className="d-flex align-items-center">
                        <strong className="text-muted me-2">Release Date:</strong>
                        <span>{new Date(patch.releaseDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}

                  <div className="col-12">
                    <div className="d-flex align-items-center">
                      <strong className="text-muted me-2">Added to Database:</strong>
                      <span>{new Date(patch.created).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {patch.updated && (
                    <div className="col-12">
                      <div className="d-flex align-items-center">
                        <strong className="text-muted me-2">Last Updated:</strong>
                        <span>{new Date(patch.updated).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-top">
                  <h4 className="h6 mb-3" style={{color: '#e67e22'}}>⚡ Actions</h4>
                  <div className="d-grid gap-2 d-md-flex">
                    <button 
                      className="btn btn-outline-dark flex-fill"
                      onClick={() => navigate('/upload')}
                    >
                      📸 Upload Similar Patch
                    </button>
                    <button 
                      className="btn btn-dark flex-fill"
                      onClick={() => navigate('/dashboard')}
                    >
                      🎒 View Collection
                    </button>

                    {user && ['Admin', 'Moderator', 'PatchMaker'].includes(user.role) && (
                      <button 
                        className="btn btn-dark flex-fill"
                        onClick={() => navigate(`/submit-patch/${patch.patchSubmissionId}`)}
                      >
                        📝 View Patch Submission
                      </button>
                    )}

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatchView;
