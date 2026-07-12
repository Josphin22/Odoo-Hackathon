import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-white dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-premium backdrop-blur-md p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendDirection = 'up', 
  className = '', 
  valueId,
  ...props 
}) => {
  const directions = {
    up: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/20',
    down: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/20',
    neutral: 'text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800'
  };

  return (
    <div 
      className={`bg-white dark:bg-slate-800/50 border border-slate-200/40 dark:border-slate-800/70 rounded-2xl shadow-premium backdrop-blur-md p-5 flex flex-col justify-between hover:shadow-premium-hover hover:-translate-y-0.5 transition-all duration-300 ${className}`}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans">
            {title}
          </span>
          <span 
            id={valueId}
            className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 font-sans"
          >
            {value}
          </span>
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-sidebar dark:bg-sidebar-dark text-primary border border-slate-100 dark:border-slate-800/50 flex items-center justify-center shrink-0">
            <Icon size={20} />
          </div>
        )}
      </div>

      {trend && (
        <div className="flex items-center gap-1.5 mt-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${directions[trendDirection]} font-sans`}>
            {trendDirection === 'up' ? '▲' : trendDirection === 'down' ? '▼' : '●'} {trend}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans">
            vs last month
          </span>
        </div>
      )}
    </div>
  );
};
