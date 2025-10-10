import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/hooks/useAuth';
import { 
  getUniversitiesAndPrograms,
  updateUserUniversityInfo
} from '../api/patchdb';
import type { 
  UniversityAndProgramModel,
  UniversityProgramModel 
} from '../api/types';

const UniversitySetup: React.FC = () => {
  const { requireAuth } = useAuth();
  const navigate = useNavigate();
  const [universities, setUniversities] = useState<UniversityAndProgramModel[]>([]);
  const [selectedUniversityCode, setSelectedUniversityCode] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    requireAuth();
    loadUniversities();
  }, [requireAuth]);

  const loadUniversities = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUniversitiesAndPrograms();
      setUniversities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load universities');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      
      await updateUserUniversityInfo(
        selectedUniversityCode || undefined,
        selectedProgram || undefined
      );
      
      // Navigate to dashboard after successful save
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save university information');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    // Navigate directly to dashboard without saving
    navigate('/dashboard');
  };

  const getSelectedUniversity = (): UniversityAndProgramModel | undefined => {
    return universities.find(u => u.code === selectedUniversityCode);
  };

  const getAvailablePrograms = (): UniversityProgramModel[] => {
    const selectedUni = getSelectedUniversity();
    return selectedUni?.programs || [];
  };

  const canSave = selectedUniversityCode !== '';

  if (loading) {
    return (
      <div className="bg-light patch-background min-vh-100">
        <div className="container-fluid">
          <div className="row justify-content-center min-vh-100 align-items-center">
            <div className="col-12 col-sm-8 col-md-6 col-lg-4">
              <div className="card shadow">
                <div className="card-body text-center p-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading universities...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light patch-background min-vh-100">
      <div className="container-fluid">
        <div className="row justify-content-center min-vh-100 align-items-center">
          <div className="col-12 col-sm-8 col-md-6 col-lg-5">
            <div className="card shadow">
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <h1 className="h2 fw-bold" style={{background: 'linear-gradient(135deg, #2c3e50, #e67e22)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                    🎓 Welcome to PatchDB!
                  </h1>
                  <p className="text-muted fs-6">Let's set up your university information</p>
                  <p className="text-muted small">This helps us show you patches from your university and connect you with fellow students</p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    <strong>Error:</strong> {error}
                  </div>
                )}

                <div className="mb-4">
                  {/* University Selection */}
                  <div className="mb-3">
                    <label htmlFor="university" className="form-label fw-semibold d-flex align-items-center">
                      <span className="me-2">🏛️</span>
                      Select your university
                    </label>
                    <select 
                      id="university"
                      className="form-select form-select-lg"
                      value={selectedUniversityCode}
                      onChange={(e) => {
                        setSelectedUniversityCode(e.target.value);
                        setSelectedProgram(''); // Reset program when university changes
                      }}
                      style={{borderRadius: '0.75rem', border: '2px solid #ecf0f1'}}
                    >
                      <option value="">Choose your university...</option>
                      {universities.map((uni) => (
                        <option key={uni.code} value={uni.code}>
                          {uni.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Program Selection - Only show if university is selected */}
                  {selectedUniversityCode && (
                    <div className="mb-3">
                      <label htmlFor="program" className="form-label fw-semibold d-flex align-items-center">
                        <span className="me-2">📚</span>
                        Select your program <span className="text-muted ms-1">(optional)</span>
                      </label>
                      <select 
                        id="program"
                        className="form-select form-select-lg"
                        value={selectedProgram}
                        onChange={(e) => setSelectedProgram(e.target.value)}
                        style={{borderRadius: '0.75rem', border: '2px solid #ecf0f1'}}
                      >
                        <option value="">Choose your program (optional)...</option>
                        {getAvailablePrograms().map((program) => (
                          <option key={program.name} value={program.name}>
                            {program.frontendName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* University Logo Preview */}
                  {selectedUniversityCode && (
                    <div className="text-center mb-3">
                      <div className="d-flex align-items-center justify-content-center">
                        {getSelectedUniversity()?.logoUrl && (
                          <img 
                            src={getSelectedUniversity()?.logoUrl}
                            alt={`${getSelectedUniversity()?.name} logo`}
                            style={{ 
                              width: '60px', 
                              height: '60px', 
                              objectFit: 'contain',
                              border: '2px solid #dee2e6',
                              borderRadius: '12px',
                              padding: '8px',
                              backgroundColor: 'white'
                            }}
                            className="me-3"
                          />
                        )}
                        <div className="text-start">
                          <div className="fw-bold text-dark">{getSelectedUniversity()?.name}</div>
                          {selectedProgram && (
                            <small className="text-muted">{selectedProgram}</small>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="d-grid gap-2">
                  <button 
                    type="button" 
                    className="btn btn-dark btn-lg" 
                    onClick={handleSave}
                    disabled={!canSave || saving}
                  >
                    {saving && (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    )}
                    {saving ? 'Saving...' : 'Complete Setup'}
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary btn-lg" 
                    onClick={handleSkip}
                    disabled={saving}
                  >
                    Skip for now
                  </button>
                </div>

                <div className="text-center mt-3">
                  <small className="text-muted">
                    Don't worry! You can always update this information later in your profile settings.
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversitySetup;
