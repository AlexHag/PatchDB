import React from 'react';
import { FullWidthPageLayout } from '../components/PageLayout';
import { ComingSoonState } from '../components/EmptyState';

const More: React.FC = () => {
  return (
    <FullWidthPageLayout className="min-vh-100 more-page">
      <ComingSoonState />
    </FullWidthPageLayout>
  );
};

export default More;
