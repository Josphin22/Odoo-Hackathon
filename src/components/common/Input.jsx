import React from 'react';

const Input = React.forwardRef(({ 
  label, 
  error, 
  type = 'text', 
  className = '', 
  containerClassName = '',
  icon: Icon,
  ...props 
}, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
      {label && (
        <label className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 font-sans uppercase">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-slate-400 dark:placeholder:text-slate-500 ${Icon ? 'pl-11' : ''} ${error ? 'border-rose-500 focus:ring-rose-500/10 focus:border-rose-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs font-medium text-rose-500 font-sans animate-slide-up">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
