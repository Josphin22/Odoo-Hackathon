import React from 'react';
import { PackageOpen } from 'lucide-react';
import Button from './Button';

const EmptyState = ({ 
  title = 'No records found', 
  description = 'There are no items matching the query or database is empty.', 
  icon: Icon = PackageOpen,
  actionText,
  onActionClick
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-200/80 dark:border-slate-800 bg-white/30 dark:bg-slate-900/10 backdrop-blur-md animate-slide-up">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 mb-4">
        <Icon size={24} />
      </div>
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 font-sans mb-1.5">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm font-sans mb-6">
        {description}
      </p>
      {actionText && onActionClick && (
        <Button variant="secondary" size="sm" onClick={onActionClick}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
