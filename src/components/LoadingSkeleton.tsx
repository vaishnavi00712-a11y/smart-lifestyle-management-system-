import React from 'react';

export const LoadingSkeleton: React.FC<{ count?: number; height?: string }> = ({
  count = 3,
  height = 'h-20',
}) => {
  return (
    <div className="space-y-3 w-full animate-pulse my-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`w-full ${height} rounded-2xl bg-slate-200/70 dark:bg-slate-800/60`}
        />
      ))}
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse p-4 sm:p-8">
      <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
};
