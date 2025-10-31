import React from 'react';
import Navigation from './Navigation';
import { LoadingPage } from './Loading';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  loading?: boolean;
  loadingMessage?: string;
  requireAuth?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className = 'bg-light min-vh-100',
  containerClassName = 'container mt-4',
  loading = false,
  loadingMessage = 'Loading...'
}) => {
  if (loading) {
    return <LoadingPage message={loadingMessage} />;
  }

  return (
    <div className={className}>
      <Navigation />
      <div className={containerClassName}>
        {children}
      </div>
    </div>
  );
};

// Specialized layouts for common patterns
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  titleStyle?: React.CSSProperties;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  titleStyle = {
    background: 'linear-gradient(135deg, #2c3e50, #e67e22)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  actions,
  className = 'row mb-4'
}) => (
  <div className={className}>
    <div className="col-12">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h2 className="h3 mb-1" style={titleStyle}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-muted mb-3">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="ms-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  </div>
);

// Common page with header layout
interface StandardPageProps extends PageLayoutProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const StandardPage: React.FC<StandardPageProps> = ({
  title,
  subtitle,
  actions,
  children,
  ...pageLayoutProps
}) => (
  <PageLayout {...pageLayoutProps}>
    <PageHeader title={title} subtitle={subtitle} actions={actions} />
    {children}
  </PageLayout>
);

// Profile-style page layout
export const ProfilePageLayout: React.FC<PageLayoutProps> = ({
  children,
  ...props
}) => (
  <PageLayout
    {...props}
    className="bg-light min-vh-100"
    containerClassName="container-fluid p-3"
  >
    <div className="row justify-content-center">
      <div className="col-12 col-lg-8 col-xl-6">
        {children}
      </div>
    </div>
  </PageLayout>
);

// Full-width page layout (like More page)
export const FullWidthPageLayout: React.FC<PageLayoutProps> = ({
  children,
  ...props
}) => (
  <PageLayout
    {...props}
    className="min-vh-100"
    containerClassName="container-fluid py-4"
  >
    <div className="row justify-content-center">
      <div className="col-12 col-md-8 col-lg-6">
        {children}
      </div>
    </div>
  </PageLayout>
);
