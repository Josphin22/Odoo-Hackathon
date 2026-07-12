import React from 'react';

const Select = React.forwardRef(({ 
  label, 
  error, 
  options = [], 
  placeholder,
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
        <select
          ref={ref}
          className={`w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 pr-10 text-sm appearance-none transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer ${Icon ? 'pl-11' : ''} ${error ? 'border-rose-500 focus:ring-rose-500/10 focus:border-rose-500' : ''} ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 text-slate-400 pointer-events-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
      {error && (
        <span className="text-xs font-medium text-rose-500 font-sans animate-slide-up">
          {error}
        </span>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
