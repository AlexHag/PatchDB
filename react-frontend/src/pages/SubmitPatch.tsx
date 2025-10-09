import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/hooks/useAuth';
import Navigation from '../components/Navigation';
import { submitPatch, getUniversities } from '../api/patchdb';
import { uploadFileWithValidation } from '../api/fileUpload';
import { initializeCamera, captureImage, resizeImage, isCameraSupported } from '../api/utils';
import type { UniversityModel, UploadPatchRequest } from '../api/types';

const SubmitPatch: React.FC = () => {
  const { user, requireAuth } = useAuth();
  const navigate = useNavigate();
  
  // Image handling state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);
  
  // Form state
  const [patchName, setPatchName] = useState('');
  const [description, setDescription] = useState('');
  const [patchMaker, setPatchMaker] = useState('');
  const [universityCode, setUniversityCode] = useState('');
  const [universitySection, setUniversitySection] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  
  // Universities data
  const [universities, setUniversities] = useState<UniversityModel[]>([]);
  const [loadingUniversities, setLoadingUniversities] = useState(true);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth and role check
  React.useEffect(() => {
    const userId = requireAuth();
    if (!userId || !user) return;
    
    // Check if user has required role
    const allowedRoles = ['Admin', 'Moderator', 'PatchMaker'];
    if (!allowedRoles.includes(user.role)) {
      navigate('/dashboard');
      return;
    }
  }, [requireAuth, user, navigate]);

  // Load universities
  useEffect(() => {
    const loadUniversities = async () => {
      try {
        const unis = await getUniversities();
        setUniversities(unis);
      } catch (error) {
        console.error('Failed to load universities:', error);
        showError('Failed to load universities');
      } finally {
        setLoadingUniversities(false);
      }
    };

    loadUniversities();
  }, []);

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showError('Please select an image file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      showError('File size must be less than 10MB.');
      return;
    }

    setSelectedFile(file);
    showImagePreview(file);
    setShowForm(true);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const showImagePreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
      setShowPreview(true);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setSelectedFile(null);
    setShowPreview(false);
    setPreviewUrl('');
    setShowForm(false);
    // Reset form
    setPatchName('');
    setDescription('');
    setPatchMaker('');
    setUniversityCode('');
    setUniversitySection('');
    setReleaseDate('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleShowCamera = async () => {
    try {
      const stream = await initializeCamera();
      setCurrentStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setShowCamera(true);
    } catch (error) {
      showError('Camera access failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleHideCamera = () => {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      setCurrentStream(null);
    }
    setShowCamera(false);
  };

  const handleCapturePhoto = async () => {
    if (!videoRef.current) {
      showError('Camera not ready');
      return;
    }

    try {
      const imageFile = await captureImage(videoRef.current);
      setSelectedFile(imageFile);
      handleHideCamera();
      showImagePreview(imageFile);
      setShowForm(true);
    } catch (error) {
      showError('Failed to capture photo: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      showError('Please select an image first.');
      return;
    }

    try {
      setLoading(true);

      // Resize image if needed
      let fileToUpload = selectedFile;
      if (selectedFile.size > 2 * 1024 * 1024) { // If larger than 2MB, resize
        fileToUpload = await resizeImage(selectedFile, 1200, 900, 0.8);
      }

      // Step 1: Upload file to S3 and get fileId
      const fileId = await uploadFileWithValidation(fileToUpload, {
        maxSizeMB: 10,
        allowedTypes: ['image/']
      });
      
      // Step 2: Submit patch with form data
      const request: UploadPatchRequest = {
        fileId,
        name: patchName.trim() || undefined,
        description: description.trim() || undefined,
        patchMaker: patchMaker.trim() || undefined,
        universityCode: universityCode || undefined,
        universitySection: universitySection.trim() || undefined,
        releaseDate: releaseDate || undefined
      };
      
      const result = await submitPatch(request);
      
      // Success - redirect to view the submission
      navigate(`/submit-patch/${result.patchSubmittionId}`);
      
    } catch (error) {
      showError('Submission failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  return (
    <div className="bg-light min-vh-100">
      <Navigation />

      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <div className="card">
              <div className="card-header">
                <h2 className="h4 mb-1" style={{background: 'linear-gradient(135deg, #8e44ad, #e67e22)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                  ✨ Submit New Patch
                </h2>
                <small className="text-muted">Add a new patch to the database with detailed information</small>
              </div>
              <div className="card-body">
                
                {/* Upload Methods */}
                {!showCamera && !showPreview && (
                  <div className="row mb-4">
                    <div className="col-12 col-sm-6 mb-3">
                      <button 
                        className="btn btn-outline-dark w-100 p-3" 
                        onClick={handleShowCamera}
                        disabled={!isCameraSupported()}
                      >
                        <svg className="mb-2" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1v6zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2z"/>
                          <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"/>
                        </svg>
                        <div>{isCameraSupported() ? '📱 Take Photo!' : '📷 Camera Not Available'}</div>
                      </button>
                    </div>
                    <div className="col-12 col-sm-6 mb-3">
                      <label htmlFor="fileInput" className="btn btn-outline-dark w-100 p-3 mb-0">
                        <svg className="mb-2" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                          <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
                        </svg>
                        <div>📁 Browse Files</div>
                      </label>
                      <input 
                        type="file" 
                        id="fileInput" 
                        ref={fileInputRef}
                        accept="image/*" 
                        className="d-none" 
                        onChange={handleFileInputChange}
                      />
                    </div>
                  </div>
                )}

                {/* Camera View */}
                {showCamera && (
                  <div>
                    <div className="camera-container mb-3">
                      <video 
                        ref={videoRef}
                        className="w-100" 
                        autoPlay 
                        playsInline
                      />
                      <div className="camera-controls">
                        <button 
                          className="capture-btn" 
                          onClick={handleCapturePhoto}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <button className="btn btn-outline-secondary" onClick={handleHideCamera}>
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Image Preview and Form */}
                {showPreview && (
                  <div>
                    <div className="text-center mb-3">
                      <img 
                        src={previewUrl}
                        className="image-preview" 
                        style={{ maxHeight: '300px' }}
                        alt="Preview"
                      />
                    </div>
                    
                    {showForm && (
                      <form onSubmit={handleSubmit}>
                        <div className="row mb-3">
                          <div className="col-md-6 mb-3">
                            <label htmlFor="patchName" className="form-label">
                              <strong>🏷️ Patch Name</strong>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="patchName"
                              value={patchName}
                              onChange={(e) => setPatchName(e.target.value)}
                              placeholder="Enter patch name (optional)"
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label htmlFor="patchMaker" className="form-label">
                              <strong>👨‍🎨 Patch Maker</strong>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="patchMaker"
                              value={patchMaker}
                              onChange={(e) => setPatchMaker(e.target.value)}
                              placeholder="Enter patch maker (optional)"
                            />
                          </div>
                        </div>

                        <div className="mb-3">
                          <label htmlFor="description" className="form-label">
                            <strong>📝 Description</strong>
                          </label>
                          <textarea
                            className="form-control"
                            id="description"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the patch (optional)"
                          />
                        </div>

                        <div className="row mb-3">
                          <div className="col-md-6 mb-3">
                            <label htmlFor="university" className="form-label">
                              <strong>🏫 University</strong>
                            </label>
                            {loadingUniversities ? (
                              <div className="text-center">
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Loading universities...
                              </div>
                            ) : (
                              <select
                                className="form-select"
                                id="university"
                                value={universityCode}
                                onChange={(e) => setUniversityCode(e.target.value)}
                              >
                                <option value="">Select university (optional)</option>
                                {universities.map((uni) => (
                                  <option key={uni.code} value={uni.code}>
                                    {uni.name}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                          <div className="col-md-6 mb-3">
                            <label htmlFor="universitySection" className="form-label">
                              <strong>🏛️ University Section</strong>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="universitySection"
                              value={universitySection}
                              onChange={(e) => setUniversitySection(e.target.value)}
                              placeholder="Enter section (optional)"
                            />
                          </div>
                        </div>

                        <div className="mb-4">
                          <label htmlFor="releaseDate" className="form-label">
                            <strong>📅 Release Date</strong>
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            id="releaseDate"
                            value={releaseDate}
                            onChange={(e) => setReleaseDate(e.target.value)}
                          />
                        </div>
                    
                        <div className="d-flex gap-2 justify-content-center">
                          <button type="button" className="btn btn-outline-secondary" onClick={clearImage}>
                            🔄 Choose Different Image
                          </button>
                          <button 
                            type="submit"
                            className="btn btn-dark" 
                            disabled={loading}
                          >
                            {loading && (
                              <span className="spinner-border spinner-border-sm me-2"></span>
                            )}
                            ✨ Submit Patch!
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* Drag & Drop Area */}
                {!showCamera && !showPreview && (
                  <div 
                    className={`upload-area mb-3 ${dragOver ? 'dragover' : ''}`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg className="mb-3" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                      <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093L6.52 10.724l-2.005-2.005A.5.5 0 0 0 4.229 8.7l-3.226 3.226A1 1 0 0 1 1.002 13V3a1 1 0 0 1 1-1h12z"/>
                    </svg>
                    <h4 className="h5" style={{color: '#8e44ad'}}>📤 Drop Your Patch Photo Here!</h4>
                    <p className="text-muted mb-2">Or use the buttons above to take a photo or browse files</p>
                    <p className="text-muted small mb-0">✨ Supports JPG, PNG, and more • Max 10MB</p>
                  </div>
                )}

                {/* Error Messages */}
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitPatch;
