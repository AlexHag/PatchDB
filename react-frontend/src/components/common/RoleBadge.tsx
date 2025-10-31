import React from 'react';

interface RoleBadgeProps {
  role: string;
  className?: string;
}

export const getRoleBadgeColor = (role: string): string => {
  switch (role) {
    case 'Admin': return 'danger';
    case 'Moderator': return 'warning';
    case 'PatchMaker': return 'info';
    default: return 'secondary';
  }
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className = '' }) => {
  // Don't render badge for regular users
  if (!role || role === 'User') return null;

  return (
    <span className={`badge bg-${getRoleBadgeColor(role)} ${className}`}>
      {role}
    </span>
  );
};
