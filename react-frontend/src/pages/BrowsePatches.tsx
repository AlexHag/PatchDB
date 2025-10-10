import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { getPatches, searchPatches, getUniversities } from '../api/patchdb';
import type { PaginationResponse, PatchResponse, SearchPatchRequest, UniversityModel } from '../api/types';

const BrowsePatches: React.FC = () => {
  const [patches, setPatches] = useState<PaginationResponse<PatchResponse>>({ count: 0, items: [] });
  const [universities, setUniversities] = useState<UniversityModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Search filters
  const [searchFilters, setSearchFilters] = useState<SearchPatchRequest>({
    name: '',
    description: '',
    patchMaker: '',
    universityCode: '',
    universitySection: '',
    skip: 0,
    take: itemsPerPage
  });
  const [isSearching, setIsSearching] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  // Load universities for dropdown
  useEffect(() => {
    const loadUniversities = async () => {
      try {
        const universitiesData = await getUniversities();
        setUniversities(universitiesData);
      } catch (error) {
        console.error('Error loading universities:', error);
      }
    };
    loadUniversities();
  }, []);

  const loadPatches = useCallback(async (page: number = 1, searchRequest?: SearchPatchRequest) => {
    try {
      setLoading(true);
      setError('');
      
      const skip = (page - 1) * itemsPerPage;
      let data: PaginationResponse<PatchResponse>;
      
      if (searchRequest && isSearching) {
        // Use search endpoint
        data = await searchPatches({
          ...searchRequest,
          skip,
          take: itemsPerPage
        });
      } else {
        // Use regular get endpoint
        data = await getPatches(skip, itemsPerPage);
      }
      
      setPatches(data);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading patches:', error);
      setError('Failed to load patches: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage, isSearching]);

  // Load patches on component mount
  useEffect(() => {
    loadPatches(1);
  }, [loadPatches]);

  const totalPages = Math.ceil(patches.count / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      loadPatches(page, isSearching ? searchFilters : undefined);
    }
  };

  const handleSearch = () => {
    setIsSearching(true);
    setCurrentPage(1);
    loadPatches(1, searchFilters);
  };

  const handleClearFilters = () => {
    setSearchFilters({
      name: '',
      description: '',
      patchMaker: '',
      universityCode: '',
      universitySection: '',
      skip: 0,
      take: itemsPerPage
    });
    setIsSearching(false);
    setCurrentPage(1);
    loadPatches(1);
  };

  const hasActiveFilters = searchFilters.name || searchFilters.description || 
    searchFilters.patchMaker || searchFilters.universityCode || searchFilters.universitySection;

  if (loading && patches.items.length === 0) {
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
              🧩 Browse Patches
            </h2>
            <p className="text-muted mb-3">Explore the complete patch collection</p>
            
            {/* Stats */}
            <div className="d-flex align-items-center mb-3">
              <div className="stat-card me-3">
                <div className="stat-number">{patches.count}</div>
                <div className="stat-label">{isSearching ? 'Search Results' : 'Total Patches'}</div>
              </div>
              {loading && (
                <div className="spinner-border spinner-border-sm text-dark" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Filters Toggle */}
        <div className="card mb-4">
          <div className="card-header">
            <button 
              className="btn btn-link w-100 text-start p-0 text-decoration-none d-flex justify-content-between align-items-center"
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              style={{color: '#2c3e50'}}
            >
              <h5 className="mb-0">🔍 Search Filters {hasActiveFilters && <span className="badge bg-dark ms-2">Active</span>}</h5>
              <svg 
                className={`transition ${isFiltersExpanded ? 'rotate-180' : ''}`}
                width="20" 
                height="20" 
                fill="currentColor" 
                viewBox="0 0 16 16"
                style={{transition: 'transform 0.2s ease'}}
              >
                <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
          </div>
          
          {/* Collapsible Filter Content */}
          <div className={`collapse ${isFiltersExpanded ? 'show' : ''}`} style={{transition: 'all 0.3s ease'}}>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="searchName" className="form-label">Patch Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="searchName"
                    placeholder="Search by name..."
                    value={searchFilters.name || ''}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="col-md-6">
                  <label htmlFor="searchPatchMaker" className="form-label">Patch Maker</label>
                  <input
                    type="text"
                    className="form-control"
                    id="searchPatchMaker"
                    placeholder="Search by maker..."
                    value={searchFilters.patchMaker || ''}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, patchMaker: e.target.value }))}
                  />
                </div>
                
                <div className="col-md-6">
                  <label htmlFor="searchUniversity" className="form-label">University</label>
                  <select
                    className="form-select"
                    id="searchUniversity"
                    value={searchFilters.universityCode || ''}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, universityCode: e.target.value }))}
                  >
                    <option value="">All Universities</option>
                    {universities.map(university => (
                      <option key={university.code} value={university.code}>
                        {university.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="col-md-6">
                  <label htmlFor="searchSection" className="form-label">University Section</label>
                  <input
                    type="text"
                    className="form-control"
                    id="searchSection"
                    placeholder="Search by section..."
                    value={searchFilters.universitySection || ''}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, universitySection: e.target.value }))}
                  />
                </div>
                
                <div className="col-12">
                  <label htmlFor="searchDescription" className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-control"
                    id="searchDescription"
                    placeholder="Search by description..."
                    value={searchFilters.description || ''}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="mt-3 d-flex gap-2">
                <button 
                  className="btn btn-dark"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
                
                {hasActiveFilters && (
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={handleClearFilters}
                    disabled={loading}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
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
        {patches.items.length === 0 && !loading && (
          <div className="text-center py-5">
            <svg className="mb-3 text-muted" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
            </svg>
            <h3 className="h4" style={{color: '#2c3e50'}}>
              {isSearching ? '🔍 No matches found' : '🧩 No patches available'}
            </h3>
            <p className="text-muted mb-3">
              {isSearching 
                ? 'Try adjusting your search filters to find what you\'re looking for.' 
                : 'No patches have been added to the collection yet.'
              }
            </p>
            {isSearching && hasActiveFilters && (
              <button 
                className="btn btn-outline-dark"
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Patches Grid */}
        {patches.items.length > 0 && (
          <>
            <div className="row g-2 g-md-3">
              {patches.items.map((patch: PatchResponse) => (
                <div key={patch.patchNumber} className="col-6 mb-3">
                  <div className="card h-100 patch-submission-card">
                    <div className="card-body p-0">
                      <div className="row g-0">
                        {/* Patch Image */}
                        <div className="col-12">
                          <Link 
                            to={`/patch/${patch.patchNumber}`}
                            className="d-block text-decoration-none"
                          >
                            <div className="position-relative patch-image-container" style={{ aspectRatio: '4/3', minHeight: '140px' }}>
                              <img 
                                src={patch.imageUrl} 
                                alt={patch.name || `Patch #${patch.patchNumber}`} 
                                loading="lazy"
                                className="w-100 h-100 object-fit-cover rounded-top-3"
                              />
                              <div className="patch-overlay rounded-top-3">
                                <div className="patch-overlay-text">
                                  <div className="small">View Patch</div>
                                  <div className="small text-primary">→</div>
                                </div>
                              </div>
                              
                              {/* Patch Number Badge */}
                              <div className="position-absolute top-0 start-0 m-2">
                                <span className="badge bg-dark">
                                  #{patch.patchNumber}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </div>
                        
                        {/* Patch Details */}
                        <div className="col-12">
                          <div className="p-3">
                            {/* Header */}
                            <div className="mb-3">
                              <h3 className="h6 mb-2" style={{color: '#2c3e50', fontSize: '0.9rem'}}>
                                <Link 
                                  to={`/patch/${patch.patchNumber}`}
                                  className="text-decoration-none"
                                  style={{color: 'inherit'}}
                                >
                                  {patch.name || `Patch #${patch.patchNumber}`}
                                </Link>
                              </h3>
                              
                              {patch.description && (
                                <p className="text-muted mb-2 d-none d-md-block" style={{ 
                                  fontSize: '0.75rem',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}>
                                  {patch.description}
                                </p>
                              )}
                            </div>
                            
                            {/* University and Maker Info */}
                            {patch.university && (
                              <div className="d-flex align-items-center mb-2">
                                {patch.university.logoUrl && (
                                  <img 
                                    src={patch.university.logoUrl} 
                                    alt={`${patch.university.name} logo`}
                                    className="me-1 me-md-2 rounded"
                                    style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                                    loading="lazy"
                                  />
                                )}
                                <div>
                                  <div className="fw-semibold" style={{color: '#2c3e50', fontSize: '0.75rem'}}>
                                    {patch.university.name}
                                  </div>
                                  {patch.universitySection && (
                                    <div className="text-muted d-none d-md-block" style={{fontSize: '0.7rem'}}>
                                      {patch.universitySection}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Additional Details */}
                            <div className="text-muted" style={{fontSize: '0.7rem'}}>
                              {patch.patchMaker && (
                                <div className="mb-1 d-none d-md-block">
                                  <strong>Maker:</strong> {patch.patchMaker}
                                </div>
                              )}
                              <div className="mb-1">
                                <strong>Created:</strong> {new Date(patch.created).toLocaleDateString()}
                              </div>
                              {patch.releaseDate && (
                                <div className="mb-1 d-none d-md-block">
                                  <strong>Release Date:</strong> {new Date(patch.releaseDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                            
                            {/* Action Button */}
                            <div className="mt-2 mt-md-3 pt-2 border-top">
                              <Link 
                                to={`/patch/${patch.patchNumber}`}
                                className="btn btn-outline-dark btn-sm w-100"
                                style={{fontSize: '0.75rem'}}
                              >
                                <span className="d-none d-md-inline">View Details </span>View →
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
                  <nav aria-label="Browse patches pagination">
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
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, patches.count)} of {patches.count} patches
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && patches.items.length > 0 && (
        <div className="loading-overlay">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowsePatches;
