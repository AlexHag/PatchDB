import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { useAuth } from '../components/hooks/useAuth';
import { 
  getCurrentUser,
  updateUserBio,
  updateUserProfilePicture,
  removeUserProfilePicture,
  updateUserUniversityInfo,
  getUniversitiesAndPrograms
} from '../api/patchdb';
import { uploadFileWithValidation } from '../api/fileUpload';
import type { 
  UserResponse,
  UniversityAndProgramModel,
  UniversityProgramModel 
} from '../api/types';

const Profile: React.FC = () => {
  const { requireAuth, userId } = useAuth();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [universities, setUniversities] = useState<UniversityAndProgramModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailText, setEmailText] = useState('');
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneText, setPhoneText] = useState('');
  const [editingUniversity, setEditingUniversity] = useState(false);
  const [selectedUniversityCode, setSelectedUniversityCode] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [uploadingProfilePicture, setUploadingProfilePicture] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    requireAuth();
    loadUserData();
    loadUniversities();
  }, [requireAuth]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError('');
      const userData = await getCurrentUser();
      setUser(userData);
      setBioText(userData.bio || '');
      setEmailText(userData.email || '');
      setPhoneText(userData.phoneNumber || '');
      
      // Find university code from the user data
      if (userData.university?.name) {
        const unis = await getUniversitiesAndPrograms();
        const matchingUni = unis.find(u => u.name === userData.university?.name);
        if (matchingUni) {
          setSelectedUniversityCode(matchingUni.code);
          setSelectedProgram(userData.universityProgram || '');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const loadUniversities = async () => {
    try {
      const data = await getUniversitiesAndPrograms();
      setUniversities(data);
    } catch (err) {
      console.error('Failed to load universities:', err);
    }
  };

  const handleProfilePictureUpload = async (file: File) => {
    try {
      setUploadingProfilePicture(true);
      setError('');
      setSuccess('');

      const fileId = await uploadFileWithValidation(file, {
        maxSizeMB: 5,
        allowedTypes: ['image/']
      });

      const updatedUser = await updateUserProfilePicture(fileId);
      setUser(updatedUser);
      setSuccess('Profile picture updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload profile picture');
    } finally {
      setUploadingProfilePicture(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      setError('');
      setSuccess('');
      const updatedUser = await removeUserProfilePicture();
      setUser(updatedUser);
      setSuccess('Profile picture removed successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove profile picture');
    }
  };

  const handleBioUpdate = async () => {
    if (!user) return;
    
    try {
      setError('');
      setSuccess('');
      const updatedUser = await updateUserBio(bioText);
      setUser(updatedUser);
      setEditingBio(false);
      setSuccess('Bio updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bio');
    }
  };

  const handleUniversityUpdate = async () => {
    if (!user) return;
    
    try {
      setError('');
      setSuccess('');
      const updatedUser = await updateUserUniversityInfo(
        selectedUniversityCode || undefined,
        selectedProgram || undefined
      );
      setUser(updatedUser);
      setEditingUniversity(false);
      setSuccess('University information updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update university information');
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleProfilePictureUpload(file);
    }
  };

  const getSelectedUniversity = (): UniversityAndProgramModel | undefined => {
    return universities.find(u => u.code === selectedUniversityCode);
  };

  const getAvailablePrograms = (): UniversityProgramModel[] => {
    const selectedUni = getSelectedUniversity();
    return selectedUni?.programs || [];
  };

  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'Admin': return 'danger';
      case 'Moderator': return 'warning';
      case 'PatchMaker': return 'info';
      default: return 'secondary';
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="container-fluid p-3">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navigation />
        <div className="container-fluid p-3">
          <div className="alert alert-danger">Failed to load user data</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="container-fluid p-3" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8 col-xl-6">
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h2 className="mb-0">
                <span className="me-2">👤</span>
                Profile
              </h2>
              <Link 
                to={`/user/${userId}`} 
                className="btn btn-outline-primary"
              >
                👁️ View Profile
              </Link>
            </div>

            {/* Alert Messages */}
            {error && (
              <div className="alert alert-danger alert-dismissible" role="alert">
                <strong>Error:</strong> {error}
                <button type="button" className="btn-close" onClick={clearMessages}></button>
              </div>
            )}
            
            {success && (
              <div className="alert alert-success alert-dismissible" role="alert">
                <strong>Success:</strong> {success}
                <button type="button" className="btn-close" onClick={clearMessages}></button>
              </div>
            )}

            {/* Profile Header Card - Social Media Style */}
            <div className="card mb-4 shadow-sm">
              <div className="card-body">
                <div className="row">
                  {/* Profile Picture Column */}
                  <div className="col-12 col-sm-auto text-center text-sm-start mb-3 mb-sm-0">
                    <div className="position-relative d-inline-block">
                      <div style={{ 
                        width: '120px', 
                        height: '120px', 
                        borderRadius: '50%', 
                        overflow: 'hidden', 
                        border: '4px solid #dee2e6',
                        margin: '0 auto'
                      }}>
                        <img 
                          src={user.profilePictureUrl || '/no_profile_picture.png'} 
                          alt="Profile" 
                          className="w-100 h-100"
                          style={{ objectFit: 'cover' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/no_profile_picture.png';
                          }}
                        />
                      </div>
                      
                      {/* Profile Picture Edit Button - Floating */}
                      <button 
                        className="btn btn-primary btn-sm position-absolute"
                        style={{ 
                          bottom: '5px', 
                          right: '5px', 
                          borderRadius: '50%', 
                          width: '32px', 
                          height: '32px', 
                          padding: '0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingProfilePicture}
                        title="Change profile picture"
                      >
                        {uploadingProfilePicture ? (
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                        ) : (
                          <span style={{ fontSize: '14px' }}>📸</span>
                        )}
                      </button>
                    </div>

                    {/* Profile Picture Actions */}
                    <div className="mt-2 d-flex flex-column gap-1">
                      {user.profilePictureUrl && (
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={handleRemoveProfilePicture}
                          disabled={uploadingProfilePicture}
                          style={{ fontSize: '12px' }}
                        >
                          🗑️ Remove
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Profile Info Column */}
                  <div className="col">
                    {/* Username & Role Row */}
                    <div className="d-flex align-items-center flex-wrap mb-2">
                      <h3 className="mb-0 me-3">{user.username}</h3>
                      {user.role && user.role !== 'User' && (
                        <span className={`badge bg-${getRoleBadgeColor(user.role)} me-2`}>
                          {user.role}
                        </span>
                      )}
                    </div>

                    {/* Member Since */}
                    <p className="text-muted mb-3" style={{ fontSize: '14px' }}>
                      📅 Member since {new Date(user.created).toLocaleDateString()}
                    </p>

                    {/* Stats Row */}
                    <div className="d-flex gap-3 gap-md-4 mb-3">
                      <Link 
                        to={`/user/${userId}/followers-following`} 
                        className="text-decoration-none text-dark"
                        style={{ cursor: 'pointer' }}
                      >
                        <div>
                          <div className="fw-bold h6 mb-0">{user.followersCount}</div>
                          <div className="text-muted" style={{ fontSize: '0.8rem' }}>followers</div>
                        </div>
                      </Link>
                      <Link 
                        to={`/user/${userId}/followers-following`} 
                        className="text-decoration-none text-dark"
                        style={{ cursor: 'pointer' }}
                      >
                        <div>
                          <div className="fw-bold h6 mb-0">{user.followingCount}</div>
                          <div className="text-muted" style={{ fontSize: '0.8rem' }}>following</div>
                        </div>
                      </Link>
                    </div>

                    {/* Bio Section */}
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0 text-muted">About</h6>
                        {!editingBio && (
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => setEditingBio(true)}
                            style={{ fontSize: '12px' }}
                          >
                            ✏️ Edit Bio
                          </button>
                        )}
                      </div>

                      {editingBio ? (
                        <div>
                          <textarea 
                            className="form-control mb-2"
                            rows={3}
                            value={bioText}
                            onChange={(e) => setBioText(e.target.value)}
                            placeholder="Tell us about yourself..."
                            maxLength={160}
                          />
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <small className="text-muted">
                              {bioText.length}/160 characters
                            </small>
                            <div className="d-flex gap-2">
                              <button 
                                className="btn btn-success btn-sm"
                                onClick={handleBioUpdate}
                              >
                                💾 Save
                              </button>
                              <button 
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                  setEditingBio(false);
                                  setBioText(user.bio || '');
                                }}
                              >
                                ❌ Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="mb-0" style={{ 
                          fontStyle: user.bio ? 'normal' : 'italic',
                          color: user.bio ? 'inherit' : '#6c757d'
                        }}>
                          {user.bio || 'No bio added yet. Click "Edit Bio" to tell others about yourself!'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            
            {/* University Information Section */}
            <div className="card mb-4 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title d-flex align-items-center mb-0">
                    <span className="me-2">🎓</span>
                    University & Program
                  </h5>
                  {!editingUniversity && (
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => setEditingUniversity(true)}
                    >
                      ✏️ Edit
                    </button>
                  )}
                </div>

                {editingUniversity ? (
                  <div>
                    {/* University Selection */}
                    <div className="mb-3">
                      <label className="form-label">University</label>
                      <select 
                        className="form-select"
                        value={selectedUniversityCode}
                        onChange={(e) => {
                          setSelectedUniversityCode(e.target.value);
                          setSelectedProgram(''); // Reset program when university changes
                        }}
                      >
                        <option value="">Select a university...</option>
                        {universities.map((uni) => (
                          <option key={uni.code} value={uni.code}>
                            {uni.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Program Selection */}
                    {selectedUniversityCode && (
                      <div className="mb-3">
                        <label className="form-label">Program (Optional)</label>
                        <select 
                          className="form-select"
                          value={selectedProgram}
                          onChange={(e) => setSelectedProgram(e.target.value)}
                        >
                          <option value="">Select a program...</option>
                          {getAvailablePrograms().map((program) => (
                            <option key={program.name} value={program.name}>
                              {program.frontendName}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={handleUniversityUpdate}
                      >
                        💾 Save
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setEditingUniversity(false);
                          // Reset to current user data
                          const unis = universities;
                          const matchingUni = unis.find(u => u.name === user.university?.name);
                          if (matchingUni) {
                            setSelectedUniversityCode(matchingUni.code);
                            setSelectedProgram(user.universityProgram || '');
                          } else {
                            setSelectedUniversityCode('');
                            setSelectedProgram('');
                          }
                        }}
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {user.university?.name ? (
                      <div className="d-flex align-items-center">
                        {user.university?.logoUrl && (
                          <img 
                            src={user.university.logoUrl}
                            alt={`${user.university.name} logo`}
                            style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                            className="me-3"
                          />
                        )}
                        <div>
                          <div className="fw-bold">{user.university.name}</div>
                          {user.universityProgram && (
                            <small className="text-muted">{user.universityProgram}</small>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted mb-0">
                        No university information set yet. Click "Edit" to add your university!
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="card mb-4 shadow-sm">
              <div className="card-body">
                <h5 className="card-title d-flex align-items-center">
                  <span className="me-2">📧</span>
                  Contact Information
                </h5>

                {/* Email */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="fw-bold">Email</label>
                    {!editingEmail && (
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setEditingEmail(true)}
                      >
                        ✏️ Edit
                      </button>
                    )}
                  </div>

                  {editingEmail ? (
                    <div>
                      <input 
                        type="email"
                        className="form-control mb-2"
                        value={emailText}
                        onChange={(e) => setEmailText(e.target.value)}
                        placeholder="your.email@example.com"
                      />
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => {
                            setEditingEmail(false);
                            setSuccess('Email update feature coming soon!');
                          }}
                        >
                          💾 Save
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setEditingEmail(false);
                            setEmailText(user.email || '');
                          }}
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted mb-0">
                      {user.email || 'No email set yet'}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="fw-bold">Phone Number</label>
                    {!editingPhone && (
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setEditingPhone(true)}
                      >
                        ✏️ Edit
                      </button>
                    )}
                  </div>

                  {editingPhone ? (
                    <div>
                      <input 
                        type="tel"
                        className="form-control mb-2"
                        value={phoneText}
                        onChange={(e) => setPhoneText(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => {
                            setEditingPhone(false);
                            setSuccess('Phone number update feature coming soon!');
                          }}
                        >
                          💾 Save
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setEditingPhone(false);
                            setPhoneText(user.phoneNumber || '');
                          }}
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted mb-0">
                      {user.phoneNumber || 'No phone number set yet'}
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
