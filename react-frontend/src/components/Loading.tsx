import React from 'react';

// Props for different loading components
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

interface LoadingOverlayProps {
  show: boolean;
  message?: string;
}

interface LoadingPageProps {
  message?: string;
}

// Small inline spinner
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'text-dark', 
  className = '' 
}) => {
  const sizeClass = size === 'sm' ? 'spinner-border-sm' : '';
  
  return (
    <span className={`spinner-border ${sizeClass} ${color} ${className}`} role="status">
      <span className="visually-hidden">Loading...</span>
    </span>
  );
};

// Full overlay for loading states
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ show, message = 'Loading...' }) => {
  if (!show) return null;

  return (
    <div className="loading-overlay">
      <div className="spinner-border text-dark" role="status">
        <span className="visually-hidden">{message}</span>
      </div>
    </div>
  );
};

// Full page loading state
export const LoadingPage: React.FC<LoadingPageProps> = ({ message = 'Loading...' }) => (
  <div className="bg-light min-vh-100">
    <div className="container mt-4">
      <div className="text-center py-5">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">{message}</span>
        </div>
        <p className="text-muted mt-3">{message}</p>
      </div>
    </div>
  </div>
);

// Centered loading for specific sections
export const LoadingCenter: React.FC<LoadingPageProps> = ({ message = 'Loading...' }) => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
    <div className="text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">{message}</span>
      </div>
      <p className="text-muted mt-3">{message}</p>
    </div>
  </div>
);

// Button loading state wrapper
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({ 
  loading, 
  loadingText, 
  children, 
  disabled,
  ...props 
}) => (
  <button {...props} disabled={loading || disabled}>
    {loading && (
      <LoadingSpinner size="sm" className="me-2" />
    )}
    {loading && loadingText ? loadingText : children}
  </button>
);
