
import React from 'react';

/**
 * A skeleton loader component to provide a better loading experience for lazy-loaded pages.
 * It mimics the general layout of the application's pages with pulsing placeholders.
 */
const SkeletonLoader: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto p-4 animate-pulse" aria-live="polite" aria-busy="true">
      {/* Hero/Banner Skeleton */}
      <div className="h-48 sm:h-64 bg-slate-200 rounded-xl mb-12"></div>

      {/* Title and Subtitle Skeleton */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="h-8 bg-slate-300 rounded-md w-3/4 sm:w-1/2 mb-4"></div>
        <div className="h-4 bg-slate-200 rounded-md w-full max-w-lg mb-1"></div>
        <div className="h-4 bg-slate-200 rounded-md w-5/6 max-w-md"></div>
      </div>

      {/* Grid/Card Section Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="h-40 bg-slate-200 rounded-lg"></div>
        <div className="h-40 bg-slate-200 rounded-lg"></div>
        <div className="h-40 bg-slate-200 rounded-lg hidden md:block"></div>
        <div className="h-40 bg-slate-200 rounded-lg hidden lg:block"></div>
        <div className="h-40 bg-slate-200 rounded-lg hidden lg:block"></div>
        <div className="h-40 bg-slate-200 rounded-lg hidden lg:block"></div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
