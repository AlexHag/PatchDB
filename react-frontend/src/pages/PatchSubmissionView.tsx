import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/hooks/useAuth';
import Navigation from '../components/Navigation';
import { getPatchSubmission, updatePatchSubmission, getUniversities } from '../api/patchdb';
import type { 
  PatchSubmittionResponse,
  UpdatePatchSubmissionRequest, 
  UniversityModel,
  PatchSubmissionStatus
} from '../api/types';

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

  // Auth check
  useEffect(() => {
    const userId = requireAuth();
    if (!userId || !user) return;
    
    // Check if user has required role
    const allowedRoles = ['Admin', 'Moderator', 'PatchMaker'];
    if (!allowedRoles.includes(user.role)) {
      navigate('/dashboard');
      return;
    }
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

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-warning text-dark';
      case 'Accepted': return 'bg-success';
      case 'Rejected': return 'bg-danger';
      case 'Duplicate': return 'bg-secondary';
      case 'Deleted': return 'bg-dark';
      default: return 'bg-light text-dark';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return '⏳';
      case 'Accepted': return '✅';
      case 'Rejected': return '❌';
      case 'Duplicate': return '🔄';
      case 'Deleted': return '🗑️';
      default: return '❓';
    }
  };

  const canUpdateStatus = (targetStatus: string) => {
    if (!user) return false;
    
    if (user.role === 'PatchMaker') {
      return targetStatus === 'Deleted';
    }
    
    return user.role === 'Admin' || user.role === 'Moderator';
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
      
    } catch (error) {
      showError('Failed to update patch info: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
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
                {getStatusIcon(submission.status)} {submission.status}
              </span>
            </div>

            <div className="row">
              {/* Image and Basic Info */}
              <div className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-header">
                    <h5 className="mb-0">📸 Patch Image</h5>
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
                    {!editing && (
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
                            {updating && <span className="spinner-border spinner-border-sm me-2"></span>}
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

            {/* Status Update Buttons */}
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">🔄 Status Management</h5>
              </div>
              <div className="card-body">
                <div className="row g-2">
                  {/* Pending */}
                  <div className="col-6 col-md-3">
                    <button 
                      className={`btn w-100 ${submission.status === 'Pending' ? 'btn-warning' : 'btn-outline-warning'}`}
                      onClick={() => handleStatusUpdate('Pending')}
                      disabled={!canUpdateStatus('Pending') || updating || submission.status === 'Pending'}
                    >
                      ⏳ Pending
                    </button>
                  </div>

                  {/* Accepted */}
                  <div className="col-6 col-md-3">
                    <button 
                      className={`btn w-100 ${submission.status === 'Accepted' ? 'btn-success' : 'btn-outline-success'}`}
                      onClick={() => handleStatusUpdate('Accepted')}
                      disabled={!canUpdateStatus('Accepted') || updating || submission.status === 'Accepted'}
                    >
                      ✅ Accepted
                    </button>
                  </div>

                  {/* Rejected */}
                  <div className="col-6 col-md-3">
                    <button 
                      className={`btn w-100 ${submission.status === 'Rejected' ? 'btn-danger' : 'btn-outline-danger'}`}
                      onClick={() => handleStatusUpdate('Rejected')}
                      disabled={!canUpdateStatus('Rejected') || updating || submission.status === 'Rejected'}
                    >
                      ❌ Rejected
                    </button>
                  </div>

                  {/* Duplicate */}
                  <div className="col-6 col-md-3">
                    <button 
                      className={`btn w-100 ${submission.status === 'Duplicate' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                      onClick={() => handleStatusUpdate('Duplicate')}
                      disabled={!canUpdateStatus('Duplicate') || updating || submission.status === 'Duplicate'}
                    >
                      🔄 Duplicate
                    </button>
                  </div>

                  {/* Deleted */}
                  <div className="col-12 col-md-6 mx-auto mt-2">
                    <button 
                      className={`btn w-100 ${submission.status === 'Deleted' ? 'btn-dark' : 'btn-outline-dark'}`}
                      onClick={() => handleStatusUpdate('Deleted')}
                      disabled={!canUpdateStatus('Deleted') || updating || submission.status === 'Deleted'}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>

                {user?.role === 'PatchMaker' && (
                  <div className="alert alert-info mt-3 mb-0">
                    <small>
                      <strong>Note:</strong> As a PatchMaker, you can only delete your own submissions.
                    </small>
                  </div>
                )}
              </div>
            </div>

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
    </div>
  );
};

export default PatchSubmissionView;
