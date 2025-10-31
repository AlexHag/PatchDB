import React from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ 
  type, 
  message, 
  dismissible = true, 
  onDismiss,
  className = ''
}) => {
  const getAlertClass = () => {
    switch (type) {
      case 'success': return 'alert-success';
      case 'error': return 'alert-danger';
      case 'warning': return 'alert-warning';
      case 'info': return 'alert-info';
      default: return 'alert-info';
    }
  };

  const getAlertTitle = () => {
    switch (type) {
      case 'success': return 'Success:';
      case 'error': return 'Error:';
      case 'warning': return 'Warning:';
      case 'info': return 'Info:';
      default: return '';
    }
  };

  if (!message) return null;

  return (
    <div className={`alert ${getAlertClass()} ${dismissible ? 'alert-dismissible' : ''} fade show ${className}`} role="alert">
      <strong>{getAlertTitle()}</strong> {message}
      {dismissible && onDismiss && (
        <button type="button" className="btn-close" onClick={onDismiss}></button>
      )}
    </div>
  );
};

// Convenience components for specific alert types
export const SuccessAlert: React.FC<Omit<AlertProps, 'type'>> = (props) => (
  <Alert {...props} type="success" />
);

export const ErrorAlert: React.FC<Omit<AlertProps, 'type'>> = (props) => (
  <Alert {...props} type="error" />
);

export const WarningAlert: React.FC<Omit<AlertProps, 'type'>> = (props) => (
  <Alert {...props} type="warning" />
);

export const InfoAlert: React.FC<Omit<AlertProps, 'type'>> = (props) => (
  <Alert {...props} type="info" />
);
