import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 my-4">
      <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200/60 dark:border-sky-800/60 flex items-center justify-center mb-4 text-sky-600 dark:text-sky-400">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-5">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs shadow-sm transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
