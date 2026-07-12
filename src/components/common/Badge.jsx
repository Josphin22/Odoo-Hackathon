import React from 'react';

const Badge = ({ children, variant = 'info', className = '' }) => {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-sans tracking-wide uppercase';
  
  const colors = {
    success: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30',
    danger: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/30',
    warning: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30',
    info: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/30',
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60',
    secondary: 'bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-400 border border-pink-200/50 dark:border-pink-900/30'
  };

  // Auto resolve visual colors based on text content if variant not explicitly customized
  let selected = variant;
  if (!variant || variant === 'info') {
    const txt = String(children).trim().toLowerCase();
    if (['available', 'active', 'completed', 'success', 'on duty'].includes(txt)) {
      selected = 'success';
    } else if (['suspended', 'retired', 'cancelled', 'danger', 'failed'].includes(txt)) {
      selected = 'danger';
    } else if (['in shop', 'warning', 'pending', 'draft'].includes(txt)) {
      selected = 'warning';
    } else if (['on trip', 'dispatched'].includes(txt)) {
      selected = 'secondary';
    } else if (['off duty'].includes(txt)) {
      selected = 'slate';
    }
  }

  return (
    <span className={`${base} ${colors[selected]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
