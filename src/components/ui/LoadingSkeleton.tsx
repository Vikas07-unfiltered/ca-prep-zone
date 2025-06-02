import React from "react";

const LoadingSkeleton: React.FC<{ height?: number | string; width?: number | string; className?: string }> = ({ height = 20, width = '100%', className = '' }) => (
  <div
    className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    style={{ height, width }}
    aria-busy="true"
    aria-label="Loading..."
  />
);

export default LoadingSkeleton;
