import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/hooks/useAuth';
import Navigation from '../components/Navigation';
import { getUnpublishedPatchSubmissions } from '../api/patchdb';
import type { PaginationResponse, PatchSubmittionResponse } from '../api/types';

const ReviewQueue: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<PaginationResponse<PatchSubmittionResponse>>({ count: 0, items: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Check if user has proper permissions
  useEffect(() => {
    if (!user || !['Admin', 'Moderator'].includes(user.role)) {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);

  const loadSubmissions = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError('');
      
      const skip = (page - 1) * itemsPerPage;
      const data = await getUnpublishedPatchSubmissions(skip, itemsPerPage);
      setSubmissions(data);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading unpublished submissions:', error);
      setError('Failed to load unpublished submissions: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  useEffect(() => {
    if (user && ['Admin', 'Moderator'].includes(user.role)) {
      loadSubmissions(1);
    }
  }, [user, loadSubmissions]);

  const totalPages = Math.ceil(submissions.count / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      loadSubmissions(page);
    }
  };

  // Don't render anything if user doesn't have permission
  if (!user || !['Admin', 'Moderator'].includes(user.role)) {
    return null;
  }

  if (loading && submissions.items.length === 0) {
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
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <h2 className="h3 mb-1" style={{background: 'linear-gradient(135deg, #2c3e50, #e67e22)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              🔍 Review Queue
            </h2>
            <p className="text-muted mb-3">Review and manage unpublished patch submissions</p>
            
            {/* Stats */}
            <div className="d-flex align-items-center mb-3">
              <div className="stat-card me-3">
                <div className="stat-number">{submissions.count}</div>
                <div className="stat-label">Unpublished Submissions</div>
              </div>
              {loading && (
                <div className="spinner-border spinner-border-sm text-dark" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}

        {/* Empty State */}
        {submissions.items.length === 0 && !loading && (
          <div className="text-center py-5">
            <svg className="mb-3 text-muted" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
            </svg>
            <h3 className="h4" style={{color: '#2c3e50'}}>🎉 All Caught Up!</h3>
            <p className="text-muted mb-3">There are no unpublished patch submissions to review right now.</p>
          </div>
        )}

        {/* Submissions Grid */}
        {submissions.items.length > 0 && (
          <>
            <div className="row g-2 g-md-3">
              {submissions.items.map((submission: PatchSubmittionResponse) => (
                <div key={submission.patchSubmittionId} className="col-6 mb-3">
                  <div className="card h-100 patch-submission-card">
                    <div className="card-body p-0">
                      <div className="row g-0">
                        {/* Patch Image */}
                        <div className="col-12">
                          <Link 
                            to={`/submit-patch/${submission.patchSubmittionId}`}
                            className="d-block text-decoration-none"
                          >
                            <div className="position-relative patch-image-container" style={{ aspectRatio: '4/3', minHeight: '140px' }}>
                              <img 
                                src={submission.imageUrl} 
                                alt={submission.name || `Submission #${submission.patchSubmittionId.slice(0, 8)}`} 
                                loading="lazy"
                                className="w-100 h-100 object-fit-cover rounded-top-3"
                              />
                              <div className="patch-overlay rounded-top-3">
                                <div className="patch-overlay-text">
                                  <div className="small">Review Submission</div>
                                  <div className="small text-primary">→</div>
                                </div>
                              </div>
                              
                              {/* Status Badge */}
                              <div className="position-absolute top-0 start-0 m-2">
                                <span className="badge bg-warning text-dark">
                                  {submission.status}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </div>
                        
                        {/* Submission Details */}
                        <div className="col-12">
                          <div className="p-3">
                            {/* Header */}
                            <div className="mb-3">
                              <h3 className="h6 mb-2" style={{color: '#2c3e50', fontSize: '0.9rem'}}>
                                <Link 
                                  to={`/submit-patch/${submission.patchSubmittionId}`}
                                  className="text-decoration-none"
                                  style={{color: 'inherit'}}
                                >
                                  {submission.name || `Submission #${submission.patchSubmittionId.slice(0, 8)}`}
                                </Link>
                              </h3>
                              
                              {submission.description && (
                                <p className="text-muted mb-2 d-none d-md-block" style={{ 
                                  fontSize: '0.75rem',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}>
                                  {submission.description}
                                </p>
                              )}
                            </div>
                            
                            {/* University and Maker Info */}
                            {submission.university && (
                              <div className="d-flex align-items-center mb-2">
                                {submission.university.logoUrl && (
                                  <img 
                                    src={submission.university.logoUrl} 
                                    alt={`${submission.university.name} logo`}
                                    className="me-1 me-md-2 rounded"
                                    style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                                    loading="lazy"
                                  />
                                )}
                                <div>
                                  <div className="fw-semibold" style={{color: '#2c3e50', fontSize: '0.75rem'}}>
                                    {submission.university.name}
                                  </div>
                                  {submission.universitySection && (
                                    <div className="text-muted d-none d-md-block" style={{fontSize: '0.7rem'}}>
                                      {submission.universitySection}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Additional Details */}
                            <div className="text-muted" style={{fontSize: '0.7rem'}}>
                              {submission.patchMaker && (
                                <div className="mb-1 d-none d-md-block">
                                  <strong>Maker:</strong> {submission.patchMaker}
                                </div>
                              )}
                              <div className="mb-1">
                                <strong>Submitted:</strong> {new Date(submission.created).toLocaleDateString()}
                              </div>
                              {submission.releaseDate && (
                                <div className="mb-1 d-none d-md-block">
                                  <strong>Release Date:</strong> {new Date(submission.releaseDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                            
                            {/* Action Button */}
                            <div className="mt-2 mt-md-3 pt-2 border-top">
                              <Link 
                                to={`/submit-patch/${submission.patchSubmittionId}`}
                                className="btn btn-outline-dark btn-sm w-100"
                                style={{fontSize: '0.75rem'}}
                              >
                                <span className="d-none d-md-inline">Review Submission </span>Review →
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="row mt-4">
                <div className="col-12">
                  <nav aria-label="Review queue pagination">
                    <ul className="pagination justify-content-center">
                      <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage <= 1}
                        >
                          Previous
                        </button>
                      </li>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </button>
                          </li>
                        );
                      })}
                      
                      <li className={`page-item ${currentPage >= totalPages ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= totalPages}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                  
                  {/* Page info */}
                  <div className="text-center text-muted small">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, submissions.count)} of {submissions.count} submissions
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && submissions.items.length > 0 && (
        <div className="loading-overlay">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewQueue;
