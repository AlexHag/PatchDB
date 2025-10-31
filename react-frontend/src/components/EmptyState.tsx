import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline-dark' | 'dark';
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`text-center py-5 ${className}`}>
      {icon && (
        <div className="mb-3">
          {icon}
        </div>
      )}
      <h3 className="h4" style={{color: '#2c3e50'}}>
        {title}
      </h3>
      {description && (
        <p className="text-muted mb-3">
          {description}
        </p>
      )}
      {action && (
        <button 
          className={`btn btn-${action.variant || 'dark'}`}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

// Common empty state configurations
export const NoSearchResultsState: React.FC<{
  onClearFilters?: () => void;
  searchType?: string;
}> = ({ onClearFilters, searchType = 'results' }) => (
  <EmptyState
    icon={
      <svg className="text-muted" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
        <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
      </svg>
    }
    title={`🔍 No ${searchType} found`}
    description="Try adjusting your search filters to find what you're looking for."
    action={onClearFilters ? {
      label: 'Clear Filters',
      onClick: onClearFilters,
      variant: 'outline-dark'
    } : undefined}
  />
);

export const NoCollectionState: React.FC<{
  onUpload: () => void;
}> = ({ onUpload }) => (
  <EmptyState
    icon={
      <svg className="text-muted" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
        <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
        <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093L6.52 10.724l-2.005-2.005A.5.5 0 0 0 4.229 8.7l-3.226 3.226A1 1 0 0 1 1.002 13V3a1 1 0 0 1 1-1h12z"/>
      </svg>
    }
    title="🌟 Your Collection Awaits!"
    description="Start building your patch collection by uploading your first patch!"
    action={{
      label: '🎯 Add Your First Patch!',
      onClick: onUpload,
      variant: 'dark'
    }}
  />
);

export const NoUsersFoundState: React.FC<{}> = () => (
  <EmptyState
    icon={
      <div className="text-muted mb-3" style={{ fontSize: '3rem' }}>👥</div>
    }
    title="No users found"
    description="Try adjusting your search filters to find more users."
  />
);

export const StartSearchingState: React.FC<{}> = () => (
  <EmptyState
    icon={
      <div className="text-muted mb-3" style={{ fontSize: '3rem' }}>🔍</div>
    }
    title="Start searching for users"
    description="Use the search filters above to find other patch collectors."
  />
);

export const ComingSoonState: React.FC<{}> = () => (
  <EmptyState
    icon={
      <svg viewBox="0 0 24 24" fill="currentColor" className="text-muted" style={{width: '80px', height: '80px'}}>
        <path d="M6,10A2,2 0 0,1 8,12A2,2 0 0,1 6,14A2,2 0 0,1 4,12A2,2 0 0,1 6,10M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M18,10A2,2 0 0,1 20,12A2,2 0 0,1 18,14A2,2 0 0,1 16,12A2,2 0 0,1 18,10Z"/>
      </svg>
    }
    title="Coming Soon"
    description="This page is under construction!"
  />
);
