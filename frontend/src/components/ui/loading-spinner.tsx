import React from 'react';

export default function LoadingSpinner({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    default: 'w-6 h-6 border-3',
    large: 'w-8 h-8 border-4'
  };

  return (
    <div
      className={`${sizeClasses[size]} border-blue-200 border-t-blue-600 dark:border-slate-600 dark:border-t-blue-400 animate-spin rounded-full`}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
