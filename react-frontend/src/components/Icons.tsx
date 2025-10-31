import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

// Common SVG Icons used throughout the app
export const HomeIcon: React.FC<IconProps> = ({ className = "nav-svg-icon", size = 24, style }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={size} height={size} style={style}>
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ className = "nav-svg-icon", size = 24, style }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={size} height={size} style={style}>
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

export const CameraIcon: React.FC<IconProps> = ({ className = "nav-svg-icon", size = 24, style }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={size} height={size} style={style}>
    <circle cx="12" cy="12" r="3.2"/>
    <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
  </svg>
);

export const ProfileIcon: React.FC<IconProps> = ({ className = "nav-svg-icon", size = 24, style }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={size} height={size} style={style}>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

export const ReviewIcon: React.FC<IconProps> = ({ className = "nav-svg-icon", size = 24, style }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={size} height={size} style={style}>
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ className = "nav-svg-icon", size = 24, style }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={size} height={size} style={style}>
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
);

export const LogoutIcon: React.FC<IconProps> = ({ className = "nav-svg-icon", size = 24, style }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={size} height={size} style={style}>
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
  </svg>
);

export const DotsIcon: React.FC<IconProps> = ({ className = "nav-svg-icon", size = 24, style }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={size} height={size} style={style}>
    <path d="M6,10A2,2 0 0,1 8,12A2,2 0 0,1 6,14A2,2 0 0,1 4,12A2,2 0 0,1 6,10M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M18,10A2,2 0 0,1 20,12A2,2 0 0,1 18,14A2,2 0 0,1 16,12A2,2 0 0,1 18,10Z"/>
  </svg>
);

export const StarIcon: React.FC<IconProps> = ({ className = "text-warning", size = 16, style }) => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={className} width={size} height={size} style={style}>
    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
  </svg>
);

export const ErrorIcon: React.FC<IconProps> = ({ className = "text-danger", size = 64, style }) => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={className} width={size} height={size} style={style}>
    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
  </svg>
);

export const InfoIcon: React.FC<IconProps> = ({ className = "text-muted", size = 64, style }) => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={className} width={size} height={size} style={style}>
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
  </svg>
);

export const ImageIcon: React.FC<IconProps> = ({ className = "text-muted", size = 48, style }) => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={className} width={size} height={size} style={style}>
    <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
    <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093L6.52 10.724l-2.005-2.005A.5.5 0 0 0 4.229 8.7l-3.226 3.226A1 1 0 0 1 1.002 13V3a1 1 0 0 1 1-1h12z"/>
  </svg>
);

export const UploadIcon: React.FC<IconProps> = ({ className = "", size = 32, style }) => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={className} width={size} height={size} style={style}>
    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
    <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
  </svg>
);

export const WarningIcon: React.FC<IconProps> = ({ className = "text-danger", size = 64, style }) => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={className} width={size} height={size} style={style}>
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
    <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
  </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ className = "", size = 20, style }) => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={className} width={size} height={size} style={style}>
    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
  </svg>
);
