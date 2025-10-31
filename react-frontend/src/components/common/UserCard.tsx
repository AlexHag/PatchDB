import React from 'react';
import { RoleBadge } from './RoleBadge';
import { LoadingButton } from '../Loading';
import type { PublicUserResponse } from '../../api/types';

interface UserCardProps {
  user: PublicUserResponse;
  onCardClick?: (userId: string) => void;
  onFollowClick?: (user: PublicUserResponse, e: React.MouseEvent) => void;
  followLoading?: boolean;
  className?: string;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onCardClick,
  onFollowClick,
  followLoading = false,
  className = ''
}) => {
  return (
    <div 
      className={`card h-100 ${className}`}
      style={{ cursor: onCardClick ? 'pointer' : 'default' }}
      onClick={() => onCardClick?.(user.id)}
    >
      <div className="card-body">
        <div className="d-flex align-items-center mb-3">
          {/* Profile Picture */}
          <div className="me-3">
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: 'linear-gradient(45deg, #405de6, #5851db, #833ab4, #c13584, #e1306c, #fd1d1d)',
              padding: '2px'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: 'white'
              }}>
                <img 
                  src={user.profilePictureUrl || '/no_profile_picture.png'} 
                  alt={`${user.username}'s profile`} 
                  className="w-100 h-100"
                  style={{ objectFit: 'cover' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/no_profile_picture.png';
                  }}
                />
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="flex-grow-1">
            <div className="d-flex align-items-center flex-wrap mb-1">
              <h6 className="mb-0 me-2">{user.username}</h6>
              <RoleBadge role={user.role} className="me-2" />
            </div>
            
            {user.university?.name && (
              <div className="d-flex align-items-center mb-1">
                {user.university?.logoUrl && (
                  <img 
                    src={user.university.logoUrl}
                    alt={`${user.university.name} logo`}
                    style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                    className="me-1"
                  />
                )}
                <small className="text-muted">{user.university.name}</small>
              </div>
            )}
            
            <small className="text-muted">
              📅 Joined {new Date(user.created).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short' 
              })}
            </small>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-muted small mb-3" style={{ 
            fontSize: '0.8rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {user.bio}
          </p>
        )}

        {/* Follow/Unfollow Button */}
        {onFollowClick && (
          <LoadingButton
            onClick={(e) => onFollowClick(user, e)}
            loading={followLoading}
            loadingText={user.isFollowing ? 'Unfollowing...' : 'Following...'}
            className={`btn w-100 ${user.isFollowing ? 'btn-outline-secondary' : 'btn-primary'}`}
            style={{ minHeight: '40px', borderRadius: '6px' }}
          >
            {user.isFollowing ? (
              <>
                <span className="me-1">✓</span>
                Following
              </>
            ) : (
              <>
                <span className="me-1">➕</span>
                Follow
              </>
            )}
          </LoadingButton>
        )}
      </div>
    </div>
  );
};

// Profile picture component that can be used independently
interface ProfilePictureProps {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  gradient?: boolean;
}

export const ProfilePicture: React.FC<ProfilePictureProps> = ({
  src,
  alt,
  size = 60,
  className = '',
  style,
  gradient = true
}) => {
  const containerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    overflow: 'hidden',
    background: gradient 
      ? 'linear-gradient(45deg, #405de6, #5851db, #833ab4, #c13584, #e1306c, #fd1d1d)'
      : 'transparent',
    padding: gradient ? '2px' : '0',
    ...style
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: gradient ? 'white' : 'transparent',
    objectFit: 'cover' as const
  };

  return (
    <div className={className} style={containerStyle}>
      {gradient ? (
        <div style={imageStyle}>
          <img 
            src={src || '/no_profile_picture.png'} 
            alt={alt}
            className="w-100 h-100"
            style={{ objectFit: 'cover' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/no_profile_picture.png';
            }}
          />
        </div>
      ) : (
        <img 
          src={src || '/no_profile_picture.png'} 
          alt={alt}
          className="w-100 h-100"
          style={imageStyle}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/no_profile_picture.png';
          }}
        />
      )}
    </div>
  );
};
