import React from 'react';
import { ChevronDownIcon } from '../Icons';
import { LoadingButton } from '../Loading';
import type { UniversityModel } from '../../api/types';

interface SearchFiltersProps {
  isExpanded: boolean;
  onToggle: () => void;
  hasActiveFilters: boolean;
  onSearch: () => void;
  onClearFilters: () => void;
  loading?: boolean;
  children: React.ReactNode;
  title?: string;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  isExpanded,
  onToggle,
  hasActiveFilters,
  onSearch,
  onClearFilters,
  loading = false,
  children,
  title = 'Search Filters'
}) => {
  return (
    <div className="card mb-3">
      <div className="card-header">
        <button 
          className="btn btn-link w-100 text-start p-0 text-decoration-none d-flex justify-content-between align-items-center"
          onClick={onToggle}
          style={{color: '#2c3e50'}}
        >
          <h5 className="mb-0">
            🔍 {title} {hasActiveFilters && <span className="badge bg-dark ms-2">Active</span>}
          </h5>
          <ChevronDownIcon 
            className={`transition ${isExpanded ? 'rotate-180' : ''}`}
            style={{transition: 'transform 0.2s ease'}}
          />
        </button>
      </div>
      
      {/* Collapsible Filter Content */}
      <div className={`collapse ${isExpanded ? 'show' : ''}`} style={{transition: 'all 0.3s ease'}}>
        <div className="card-body">
          {children}
          
          <div className="mt-3 d-flex gap-2">
            <LoadingButton 
              className="btn btn-dark"
              onClick={onSearch}
              loading={loading}
              loadingText="Searching..."
            >
              Search
            </LoadingButton>
            
            {hasActiveFilters && (
              <button 
                className="btn btn-outline-secondary"
                onClick={onClearFilters}
                disabled={loading}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Common filter inputs
interface FilterInputProps {
  label: string;
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'tel';
}

export const FilterInput: React.FC<FilterInputProps> = ({
  label,
  id,
  placeholder,
  value,
  onChange,
  type = 'text'
}) => (
  <div className="col-md-6">
    <label htmlFor={id} className="form-label">{label}</label>
    <input
      type={type}
      className="form-control"
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

interface FilterSelectProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
  label,
  id,
  value,
  onChange,
  options,
  placeholder = 'Select...'
}) => (
  <div className="col-md-6">
    <label htmlFor={id} className="form-label">{label}</label>
    <select
      className="form-select"
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

// University selector component
interface UniversitySelectorProps {
  universities: UniversityModel[];
  selectedCode: string;
  onSelect: (code: string) => void;
  placeholder?: string;
  className?: string;
}

export const UniversitySelector: React.FC<UniversitySelectorProps> = ({
  universities,
  selectedCode,
  onSelect,
  placeholder = 'All Universities',
  className = 'col-md-6'
}) => (
  <FilterSelect
    label="University"
    id="searchUniversity"
    value={selectedCode}
    onChange={onSelect}
    options={universities.map(uni => ({
      value: uni.code,
      label: uni.name
    }))}
    placeholder={placeholder}
  />
);
