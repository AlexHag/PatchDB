import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon } from './Icons';
import type { UserPatchModel, PatchResponse } from '../api/types';

interface BasePatchCardProps {
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

// For user's owned patches (Dashboard)
interface UserPatchCardProps extends BasePatchCardProps {
  patch: UserPatchModel;
  type: 'user';
}

// For browsing all patches (BrowsePatches)
interface BrowsePatchCardProps extends BasePatchCardProps {
  patch: PatchResponse;
  type: 'browse';
}

// Union type for patch cards
type PatchCardProps = UserPatchCardProps | BrowsePatchCardProps;

export const PatchCard: React.FC<PatchCardProps> = ({ patch, type, className = '', onClick, style }) => {
  // Extract common properties based on patch type
  const getPatchData = () => {
    if (type === 'user') {
      const userPatch = patch as UserPatchModel;
      return {
        patchNumber: userPatch.matchingPatch.patchNumber,
        name: userPatch.matchingPatch.name,
        imageUrl: userPatch.matchingPatch.imageUrl,
        description: userPatch.matchingPatch.description,
        university: userPatch.matchingPatch.university,
        universitySection: userPatch.matchingPatch.universitySection,
        patchMaker: userPatch.matchingPatch.patchMaker,
        releaseDate: userPatch.matchingPatch.releaseDate,
        created: userPatch.matchingPatch.created,
        isFavorite: userPatch.isFavorite,
        aquiredAt: userPatch.aquiredAt,
        hasPatch: true
      };
    } else {
      const browsePatch = patch as PatchResponse;
      return {
        patchNumber: browsePatch.patchNumber,
        name: browsePatch.name,
        imageUrl: browsePatch.imageUrl,
        description: browsePatch.description,
        university: browsePatch.university,
        universitySection: browsePatch.universitySection,
        patchMaker: browsePatch.patchMaker,
        releaseDate: browsePatch.releaseDate,
        created: browsePatch.created,
        isFavorite: false,
        aquiredAt: null,
        hasPatch: browsePatch.hasPatch
      };
    }
  };

  const patchData = getPatchData();

  return (
    <div className={`card h-100 patch-collection-card ${className}`} style={style} onClick={onClick}>
      <div className="card-body p-0">
        <div className="row g-0">
          {/* Patch Image */}
          <div className="col-12">
            <Link 
              to={`/patch/${patchData.patchNumber}`}
              className="d-block text-decoration-none"
            >
              <div className="position-relative patch-image-container" style={{ aspectRatio: '4/3', minHeight: '140px' }}>
                <img 
                  src={patchData.imageUrl} 
                  alt={patchData.name || `Patch #${patchData.patchNumber}`} 
                  loading="lazy"
                  className="w-100 h-100 object-fit-cover rounded-top-3"
                />
                <div className="patch-overlay rounded-top-3">
                  <div className="patch-overlay-text">
                    <div className="small">View {type === 'user' ? 'Details' : 'Patch'}</div>
                    <div className="small text-primary">→</div>
                  </div>
                </div>
                
                {/* Favorite Badge for user patches */}
                {type === 'user' && patchData.isFavorite && (
                  <div className="position-absolute top-0 end-0 m-2">
                    <StarIcon size={16} />
                  </div>
                )}

                {/* "You have this" badge for browse patches */}
                {type === 'browse' && patchData.hasPatch && (
                  <div className="position-absolute top-0 start-0 m-2">
                    <span className="badge bg-dark">
                      You have this Patch!
                    </span>
                  </div>
                )}
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
                    to={`/patch/${patchData.patchNumber}`}
                    className="text-decoration-none"
                    style={{color: 'inherit'}}
                  >
                    {patchData.name || `Patch #${patchData.patchNumber}`}
                  </Link>
                </h3>
                
                {patchData.description && (
                  <p className="text-muted mb-2 d-none d-md-block" style={{ 
                    fontSize: '0.75rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {patchData.description}
                  </p>
                )}
              </div>
              
              {/* University and Maker Info */}
              {patchData.university && (
                <div className="d-flex align-items-center mb-2">
                  {patchData.university.logoUrl && (
                    <img 
                      src={patchData.university.logoUrl} 
                      alt={`${patchData.university.name} logo`}
                      className="me-1 me-md-2 rounded"
                      style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                      loading="lazy"
                    />
                  )}
                  <div>
                    <div className="fw-semibold" style={{color: '#2c3e50', fontSize: '0.75rem'}}>
                      {patchData.university.name}
                    </div>
                    {patchData.universitySection && (
                      <div className="text-muted d-none d-md-block" style={{fontSize: '0.7rem'}}>
                        {patchData.universitySection}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Additional Details */}
              <div className="text-muted" style={{fontSize: '0.7rem'}}>
                {patchData.patchMaker && (
                  <div className="mb-1 d-none d-md-block">
                    <strong>Maker:</strong> {patchData.patchMaker}
                  </div>
                )}
                <div className="mb-1">
                  <strong>
                    {type === 'user' ? 'Acquired:' : 'Created:'}
                  </strong>{' '}
                  {type === 'user' && patchData.aquiredAt 
                    ? new Date(patchData.aquiredAt).toLocaleDateString()
                    : new Date(patchData.created).toLocaleDateString()
                  }
                </div>
                {patchData.releaseDate && (
                  <div className="mb-1 d-none d-md-block">
                    <strong>
                      {type === 'user' ? 'Released:' : 'Release Date:'}
                    </strong>{' '}
                    {type === 'user' 
                      ? new Date(patchData.releaseDate).getFullYear()
                      : new Date(patchData.releaseDate).toLocaleDateString()
                    }
                  </div>
                )}
              </div>
              
              {/* Action Button */}
              <div className="mt-2 mt-md-3 pt-2 border-top">
                <Link 
                  to={`/patch/${patchData.patchNumber}`}
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
  );
};
