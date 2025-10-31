import React, { useState, useEffect, useCallback } from 'react';
import { StandardPage } from '../components/PageLayout';
import { PatchCard } from '../components/PatchCard';
import { SearchFilters, FilterInput, UniversitySelector } from '../components/common/SearchFilters';
import { Pagination } from '../components/Pagination';
import { NoSearchResultsState } from '../components/EmptyState';
import { LoadingPage, LoadingSpinner } from '../components/Loading';
import { ErrorAlert } from '../components/Alert';
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

  const hasActiveFilters = !!(searchFilters.name || searchFilters.description || 
    searchFilters.patchMaker || searchFilters.universityCode || searchFilters.universitySection);

  if (loading && patches.items.length === 0) {
    return <LoadingPage message="Loading patches..." />;
  }

  return (
    <StandardPage
      title="🧩 Browse Patches"
      subtitle="Explore the complete patch collection"
      actions={loading ? <LoadingSpinner size="sm" /> : undefined}
    >

      {/* Search Filters */}
      <SearchFilters
        isExpanded={isFiltersExpanded}
        onToggle={() => setIsFiltersExpanded(!isFiltersExpanded)}
        hasActiveFilters={hasActiveFilters}
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
        loading={loading}
      >
        <div className="row g-3">
          <FilterInput
            label="Patch Name"
            id="searchName"
            placeholder="Search by name..."
            value={searchFilters.name || ''}
            onChange={(value) => setSearchFilters(prev => ({ ...prev, name: value }))}
          />
          
          <FilterInput
            label="Patch Maker"
            id="searchPatchMaker"
            placeholder="Search by maker..."
            value={searchFilters.patchMaker || ''}
            onChange={(value) => setSearchFilters(prev => ({ ...prev, patchMaker: value }))}
          />
          
          <UniversitySelector
            universities={universities}
            selectedCode={searchFilters.universityCode || ''}
            onSelect={(code) => setSearchFilters(prev => ({ ...prev, universityCode: code }))}
          />
          
          <FilterInput
            label="University Section"
            id="searchSection"
            placeholder="Search by section..."
            value={searchFilters.universitySection || ''}
            onChange={(value) => setSearchFilters(prev => ({ ...prev, universitySection: value }))}
          />
          
          <FilterInput
            label="Description"
            id="searchDescription"
            placeholder="Search by description..."
            value={searchFilters.description || ''}
            onChange={(value) => setSearchFilters(prev => ({ ...prev, description: value }))}
          />
        </div>
      </SearchFilters>

      {/* Search Results Count */}
      {patches.items.length > 0 && (
        <div className="mb-3">
          <small className="text-muted">
            {isSearching ? `Found ${patches.count} search result${patches.count !== 1 ? 's' : ''}` : `Showing ${patches.items.length} of ${patches.count} patches`}
          </small>
        </div>
      )}

      {/* Error Message */}
      {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

      {/* Empty State */}
      {patches.items.length === 0 && !loading && (
        <NoSearchResultsState 
          onClearFilters={isSearching && hasActiveFilters ? handleClearFilters : undefined}
          searchType="patches"
        />
      )}

      {/* Patches Grid */}
      {patches.items.length > 0 && (
        <>
          <div className="row g-2 g-md-3">
            {patches.items.map((patch: PatchResponse) => (
              <div key={patch.patchNumber} className="col-6 mb-3">
                <PatchCard patch={patch} type="browse" />
              </div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={patches.count}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            disabled={loading}
          />
        </>
      )}
    </StandardPage>
  );
};

export default BrowsePatches;
