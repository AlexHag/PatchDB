import React from 'react';
import Navigation from '../components/Navigation';

const More: React.FC = () => {
  return (
    <div className="min-vh-100 more-page">
      <Navigation />
      
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="text-center py-5">
              <div className="mb-4">
                <svg viewBox="0 0 24 24" fill="currentColor" className="text-muted" style={{width: '80px', height: '80px'}}>
                  <path d="M6,10A2,2 0 0,1 8,12A2,2 0 0,1 6,14A2,2 0 0,1 4,12A2,2 0 0,1 6,10M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M18,10A2,2 0 0,1 20,12A2,2 0 0,1 18,14A2,2 0 0,1 16,12A2,2 0 0,1 18,10Z"/>
                </svg>
              </div>
              
              <h2 className="display-4 text-muted mb-3" style={{fontWeight: '300'}}>
                Coming Soon
              </h2>
              
              <p className="lead text-muted mb-4">
                This page is under construction! 
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default More;
