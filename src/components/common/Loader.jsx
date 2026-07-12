import React from 'react';

const Loader = ({ fullPage = false, message = 'Loading...' }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3.5 p-6">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-primary/25"></div>
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spinner"></div>
      </div>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans tracking-wide uppercase">
        {message}
      </p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/5 dark:bg-black/20 backdrop-blur-xs">
        <div className="glassmorphism dark:glassmorphism-dark p-8 rounded-2xl shadow-glass">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default Loader;
