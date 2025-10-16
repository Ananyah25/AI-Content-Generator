// src/components/ErrorMessage.js
import React from 'react';
import { API_ENDPOINTS, apiRequest } from '../config/api';

const ErrorMessage = ({ error, onDismiss, showRetry = false, onRetry }) => {
  if (!error) return null;

  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    return 'An unexpected error occurred';
  };

  const getErrorType = (error) => {
    if (error?.message?.includes('AI service')) return 'ai-error';
    if (error?.message?.includes('network')) return 'network-error';
    if (error?.message?.includes('Rate limit')) return 'rate-limit-error';
    return 'general-error';
  };

  return (
    <div className={`error-message ${getErrorType(error)}`}>
      <div className="error-icon">⚠️</div>
      <div className="error-text">
        <strong>Error:</strong> {getErrorMessage(error)}
      </div>
      <div className="error-actions">
        {showRetry && onRetry && (
          <button onClick={onRetry} className="retry-btn">
            Try Again
          </button>
        )}
        {onDismiss && (
          <button onClick={onDismiss} className="dismiss-btn">
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
