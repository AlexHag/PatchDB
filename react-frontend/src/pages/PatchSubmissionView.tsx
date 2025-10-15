import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/hooks/useAuth';
import Navigation from '../components/Navigation';
import { getPatchSubmission, updatePatchSubmission, getUniversities } from '../api/patchdb';
import type { 
  PatchSubmittionResponse,
  UpdatePatchSubmissionRequest, 
  UniversityModel
} from '../api/types';
import { PatchSubmissionStatus } from '../api/types';

const PatchSubmissionView: React.FC = () => {
  const { patchSubmittionId } = useParams<{ patchSubmittionId: string }>();
  const { user, requireAuth } = useAuth();
  const navigate = useNavigate();
  
  // Data state
  const [submission, setSubmission] = useState<PatchSubmittionResponse | null>(null);
  const [universities, setUniversities] = useState<UniversityModel[]>([]);
  
  // Form state
  const [editing, setEditing] = useState(false);
  const [patchName, setPatchName] = useState('');
  const [description, setDescription] = useState('');
  const [patchMaker, setPatchMaker] = useState('');
  const [universityCode, setUniversityCode] = useState('');
  const [universitySection, setUniversitySection] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auth check
  useEffect(() => {
    const userId = requireAuth();
    if (!userId || !user) return;

  }, [requireAuth, user, navigate]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!patchSubmittionId) {
        navigate('/dashboard');
        return;
      }

      try {
        setLoading(true);
        const [patchData, universityData] = await Promise.all([
          getPatchSubmission(patchSubmittionId),
          getUniversities()
        ]);
        
        setSubmission(patchData);
        setUniversities(universityData);
        
        // Initialize form with current values
        setPatchName(patchData.name || '');
        setDescription(patchData.description || '');
        setPatchMaker(patchData.patchMaker || '');
        setUniversityCode(patchData.university?.code || '');
        setUniversitySection(patchData.universitySection || '');
        setReleaseDate(patchData.releaseDate ? patchData.releaseDate.split('T')[0] : '');
        
      } catch (error) {
        showError('Failed to load patch submission: ' + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patchSubmittionId, navigate]);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const showError = (message: string) => {
    setError(message);
    setShowSuccess(false);
    setTimeout(() => setError(''), 5000);
  };

  const showSuccessMessage = (message: string) => {
    setSuccess(message);
    setError(''); // Clear any existing errors
    setShowSuccess(true);
    
    // Auto-hide success message after 4 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setTimeout(() => setSuccess(''), 300); // Wait for fade out animation
    }, 4000);
  };

  const getStatusBadgeClass = (status: PatchSubmissionStatus) => {
    switch (status) {
      case PatchSubmissionStatus.Unpublished: return 'bg-secondary text-white';
      case PatchSubmissionStatus.Published: return 'bg-success';
      case PatchSubmissionStatus.Rejected: return 'bg-danger';
      case PatchSubmissionStatus.Duplicate: return 'bg-secondary';
      case PatchSubmissionStatus.Deleted: return 'bg-dark';
      default: return 'bg-light text-dark';
    }
  };

  const getStatusIcon = (status: PatchSubmissionStatus) => {
    switch (status) {
      case PatchSubmissionStatus.Unpublished: return '📄';
      case PatchSubmissionStatus.Published: return '✅';
      case PatchSubmissionStatus.Rejected: return '❌';
      case PatchSubmissionStatus.Duplicate: return '🔄';
      case PatchSubmissionStatus.Deleted: return '🗑️';
      default: return '❓';
    }
  };

  const canEdit = () => {
    if (!user || !submission) return false;
    
    // User can edit if they own the submission OR they are Admin/Moderator
    return submission.uploadedByUserId === user.id || 
           user.role === 'Admin' || 
           user.role === 'Moderator';
  };

  const canUpdateStatus = (targetStatus: PatchSubmissionStatus) => {
    if (!user || !submission) return false;

    return true;

    // TODO: Fix this
    
    // Check if user owns the submission
    // const isOwner = submission.uploadedByUserId === user.id;
    // const isModerator = user.role === 'Admin' || user.role === 'Moderator';
    
    // // if (isOwner) {
    // //   // Owners can only delete their submissions
    // //   return targetStatus === PatchSubmissionStatus.Deleted;
    // // }
    
    // if (isModerator) {
    //   // Moderators and admins can change any status
    //   return true;
    // }
    
    // return false;
  };

  const handleUpdateInfo = async () => {
    if (!submission) return;
    
    try {
      setUpdating(true);
      
      const request: UpdatePatchSubmissionRequest = {
        id: submission.patchSubmittionId,
        name: patchName.trim() || undefined,
        description: description.trim() || undefined,
        patchMaker: patchMaker.trim() || undefined,
        universityCode: universityCode || undefined,
        universitySection: universitySection.trim() || undefined,
        releaseDate: releaseDate || undefined
      };
      
      const updatedSubmission = await updatePatchSubmission(request);
      setSubmission(updatedSubmission);
      setEditing(false);
      showSuccessMessage('✅ Patch information updated successfully!');
      
    } catch (error) {
      showError('Failed to update patch info: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = async (newStatus: PatchSubmissionStatus) => {
    if (!submission || !canUpdateStatus(newStatus)) return;
    
    const confirmMessage = `Are you sure you want to update the status to ${newStatus}?`;
    if (!window.confirm(confirmMessage)) return;
    
    try {
      setUpdating(true);
      
      const request: UpdatePatchSubmissionRequest = {
        id: submission.patchSubmittionId,
        name: patchName.trim() || undefined,
        description: description.trim() || undefined,
        patchMaker: patchMaker.trim() || undefined,
        universityCode: universityCode || undefined,
        universitySection: universitySection.trim() || undefined,
        releaseDate: releaseDate || undefined,
        status: newStatus
      };
      
      const updatedSubmission = await updatePatchSubmission(request);
      setSubmission(updatedSubmission);
      setEditing(false);
      
      // Show success message with appropriate emoji based on status
      const statusEmoji = getStatusIcon(newStatus);
      showSuccessMessage(`${statusEmoji} Status updated to ${newStatus} successfully!`);
      
    } catch (error) {
      showError('Failed to update status: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    if (!submission) return;
    
    // Reset form to original values
    setPatchName(submission.name || '');
    setDescription(submission.description || '');
    setPatchMaker(submission.patchMaker || '');
    setUniversityCode(submission.university?.code || '');
    setUniversitySection(submission.universitySection || '');
    setReleaseDate(submission.releaseDate ? submission.releaseDate.split('T')[0] : '');
    setEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-light min-vh-100">
        <Navigation />
        <div className="container mt-4">
          <div className="text-center">
            <span className="spinner-border spinner-border-lg me-2"></span>
            Loading patch submission...
          </div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="bg-light min-vh-100">
        <Navigation />
        <div className="container mt-4">
          <div className="alert alert-danger">
            Patch submission not found.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <Navigation />

      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="h4 mb-1" style={{background: 'linear-gradient(135deg, #8e44ad, #e67e22)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                  🔍 Patch Submission Details
                </h2>
                <small className="text-muted">ID: {submission.patchSubmittionId}</small>
              </div>
              <span className={`badge ${getStatusBadgeClass(submission.status)} fs-6`}>
                {/* {getStatusIcon(submission.status)} {getStatusDisplayName(submission.status)} */}
                {getStatusIcon(submission.status)} {submission.status}
              </span>
            </div>

            <div className="row">
              {/* Image and Basic Info */}
              <div className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">📸 Patch Image</h5>
                    {canEdit() && (
                      <div className="position-relative" ref={dropdownRef}>
                        <button 
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setShowDropdown(!showDropdown)}
                          style={{ border: 'none', background: 'transparent' }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="2"/>
                            <circle cx="12" cy="12" r="2"/>
                            <circle cx="12" cy="19" r="2"/>
                          </svg>
                        </button>
                        {showDropdown && (
                          <div className="dropdown-menu show position-absolute" style={{ right: 0, top: '100%', minWidth: '200px', zIndex: 1000 }}>
                            {submission.status !== PatchSubmissionStatus.Published && canUpdateStatus(PatchSubmissionStatus.Published) && (
                              <button 
                                className="dropdown-item"
                                onClick={() => {
                                  handleStatusUpdate(PatchSubmissionStatus.Published);
                                  setShowDropdown(false);
                                }}
                              >
                                ✅ Publish
                              </button>
                            )}
                            {submission.status !== PatchSubmissionStatus.Unpublished && canUpdateStatus(PatchSubmissionStatus.Unpublished) && (
                              <button 
                                className="dropdown-item"
                                onClick={() => {
                                  handleStatusUpdate(PatchSubmissionStatus.Unpublished);
                                  setShowDropdown(false);
                                }}
                              >
                                📄 Unpublish
                              </button>
                            )}
                            {submission.status !== PatchSubmissionStatus.Deleted && canUpdateStatus(PatchSubmissionStatus.Deleted) && (
                              <button 
                                className="dropdown-item"
                                onClick={() => {
                                  handleStatusUpdate(PatchSubmissionStatus.Deleted);
                                  setShowDropdown(false);
                                }}
                              >
                                🗑️ Delete
                              </button>
                            )}
                            {(user?.role === 'Admin' || user?.role === 'Moderator') && (
                              <>
                                {submission.status !== PatchSubmissionStatus.Rejected && (
                                  <button 
                                    className="dropdown-item"
                                    onClick={() => {
                                      handleStatusUpdate(PatchSubmissionStatus.Rejected);
                                      setShowDropdown(false);
                                    }}
                                  >
                                    ❌ Reject this patch
                                  </button>
                                )}
                                {submission.status !== PatchSubmissionStatus.Duplicate && (
                                  <button 
                                    className="dropdown-item"
                                    onClick={() => {
                                      handleStatusUpdate(PatchSubmissionStatus.Duplicate);
                                      setShowDropdown(false);
                                    }}
                                  >
                                    🔄 Mark as duplicate
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="card-body text-center">
                    <img 
                      src={submission.imageUrl}
                      className="img-fluid rounded mb-3" 
                      style={{ maxHeight: '400px' }}
                      alt="Patch"
                    />
                    
                    {/* University Info */}
                    {submission.university && (
                      <div className="d-flex align-items-center justify-content-center">
                        <img 
                          src={submission.university.logoUrl}
                          className="me-2" 
                          style={{ height: '32px', width: '32px', objectFit: 'contain' }}
                          alt={submission.university.name}
                        />
                        <div>
                          <div className="fw-bold">{submission.university.name}</div>
                          <small className="text-muted">{submission.university.code}</small>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Patch Details Form */}
              <div className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">📝 Patch Details</h5>
                    {!editing && canEdit() && (
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setEditing(true)}
                      >
                        ✏️ Edit
                      </button>
                    )}
                  </div>
                  <div className="card-body">
                    
                    {editing ? (
                      <div>
                        <div className="mb-3">
                          <label className="form-label"><strong>🏷️ Name</strong></label>
                          <input
                            type="text"
                            className="form-control"
                            value={patchName}
                            onChange={(e) => setPatchName(e.target.value)}
                            placeholder="Patch name"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label"><strong>📝 Description</strong></label>
                          <textarea
                            className="form-control"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Patch description"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label"><strong>👨‍🎨 Patch Maker</strong></label>
                          <input
                            type="text"
                            className="form-control"
                            value={patchMaker}
                            onChange={(e) => setPatchMaker(e.target.value)}
                            placeholder="Patch maker"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label"><strong>🏫 University</strong></label>
                          <select
                            className="form-select"
                            value={universityCode}
                            onChange={(e) => setUniversityCode(e.target.value)}
                          >
                            <option value="">Select university</option>
                            {universities.map((uni) => (
                              <option key={uni.code} value={uni.code}>
                                {uni.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="form-label"><strong>🏛️ University Section</strong></label>
                          <input
                            type="text"
                            className="form-control"
                            value={universitySection}
                            onChange={(e) => setUniversitySection(e.target.value)}
                            placeholder="University section"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label"><strong>📅 Release Date</strong></label>
                          <input
                            type="date"
                            className="form-control"
                            value={releaseDate}
                            onChange={(e) => setReleaseDate(e.target.value)}
                          />
                        </div>

                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-outline-secondary"
                            onClick={handleCancelEdit}
                            disabled={updating}
                          >
                            ❌ Cancel
                          </button>
                           <button 
                             className="btn btn-secondary"
                             onClick={handleUpdateInfo}
                             disabled={updating}
                           >
                             💾 Update Info
                           </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-3">
                          <strong>🏷️ Name:</strong>
                          <div className="text-muted">{submission.name || 'Not specified'}</div>
                        </div>

                        <div className="mb-3">
                          <strong>📝 Description:</strong>
                          <div className="text-muted">{submission.description || 'Not specified'}</div>
                        </div>

                        <div className="mb-3">
                          <strong>👨‍🎨 Patch Maker:</strong>
                          <div className="text-muted">{submission.patchMaker || 'Not specified'}</div>
                        </div>

                        <div className="mb-3">
                          <strong>🏛️ University Section:</strong>
                          <div className="text-muted">{submission.universitySection || 'Not specified'}</div>
                        </div>

                        <div className="mb-3">
                          <strong>📅 Release Date:</strong>
                          <div className="text-muted">
                            {submission.releaseDate ? formatDate(submission.releaseDate) : 'Not specified'}
                          </div>
                        </div>

                        <div className="mb-3">
                          <strong>📅 Created:</strong>
                          <div className="text-muted">{formatDate(submission.created)}</div>
                        </div>

                        {submission.updated && (
                          <div className="mb-3">
                            <strong>🔄 Last Updated:</strong>
                            <div className="text-muted">{formatDate(submission.updated)}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Name Required Tip Card */}
            {(!submission.name || submission.name.trim() === '') && canEdit() && (
              <div className="card mb-4">
                <div className="card-body">
                  <div className="alert alert-info mb-0">
                    <h6 className="alert-heading">💡 Publishing Tip</h6>
                    <p className="mb-0">A patch name is required to publish this patch. Please add a name in the patch details above.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {canEdit() && (
              <div className="card">
                <div className="card-body text-center">
                  {submission.status === PatchSubmissionStatus.Unpublished && canUpdateStatus(PatchSubmissionStatus.Published) && (
                    <button 
                      className="btn btn-success btn-lg"
                      onClick={() => handleStatusUpdate(PatchSubmissionStatus.Published)}
                      disabled={updating || !submission.name || submission.name.trim() === ''}
                    >
                      ✅ Publish Patch
                    </button>
                  )}
                  {submission.status === PatchSubmissionStatus.Published && canUpdateStatus(PatchSubmissionStatus.Deleted) && (
                    <button 
                      className="btn btn-outline-danger btn-lg"
                      onClick={() => handleStatusUpdate(PatchSubmissionStatus.Deleted)}
                      disabled={updating}
                    >
                      🗑️ Delete Patch
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Success Messages */}
            {success && (
              <div 
                className={`alert alert-success alert-dismissible mt-3 ${showSuccess ? 'fade show' : 'fade'}`} 
                style={showSuccess ? {
                  animation: 'pulse 0.6s ease-in-out',
                  backgroundColor: '#d1e7dd',
                  borderColor: '#a3cfbb',
                  color: '#0a3622'
                } : {}}
                role="alert"
              >
                <strong>{success}</strong>
                <button type="button" className="btn-close" onClick={() => {
                  setShowSuccess(false);
                  setTimeout(() => setSuccess(''), 300);
                }}></button>
              </div>
            )}

            {/* Error Messages */}
            {error && (
              <div className="alert alert-danger alert-dismissible fade show mt-3" role="alert">
                {error}
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Central Loading Overlay */}
      {updating && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 9999,
            backdropFilter: 'blur(3px)',
            animation: 'fadeIn 0.3s ease-in-out'
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="loading-title"
        >
          <div 
            className="text-center text-white bg-dark rounded-3 p-4" 
            style={{ 
              minWidth: '280px', 
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              transform: 'scale(1)',
              animation: 'fadeInScale 0.3s ease-out'
            }}
          >
            <div className="spinner-border text-light mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5 className="mb-2" id="loading-title">⚡ Updating patch submission...</h5>
            <small className="text-light opacity-75">Please wait while we process your request</small>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeInScale {
            from { 
              opacity: 0; 
              transform: scale(0.9);
            }
            to { 
              opacity: 1; 
              transform: scale(1);
            }
          }
        `}
      </style>
    </div>
  );
};

export default PatchSubmissionView;
