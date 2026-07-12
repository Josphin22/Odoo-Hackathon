import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Badge from '../common/Badge';

const Header = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Resolve page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Operational Command';
    if (path.startsWith('/vehicles')) return 'Fleet Assets';
    if (path.startsWith('/drivers')) return 'Driver Directory';
    if (path.startsWith('/trips')) return 'Trip Management & Dispatch';
    if (path.startsWith('/maintenance')) return 'Maintenance Logs';
    if (path.startsWith('/fuel')) return 'Fuel Records';
    if (path.startsWith('/expenses')) return 'Expense Ledger';
    if (path.startsWith('/reports')) return 'Analytics Insights';
    if (path.startsWith('/profile')) return 'User Settings';
    return 'TransitOps';
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'FLEET_MANAGER': return 'Fleet Manager';
      case 'DRIVER': return 'Operator (Driver)';
      case 'SAFETY_OFFICER': return 'Safety Officer';
      case 'FINANCIAL_ANALYST': return 'Financial Analyst';
      default: return role;
    }
  };

  return (
    <header className="bg-white/40 dark:bg-slate-900/40 border-b border-slate-200/50 dark:border-slate-900/60 h-18 sticky top-0 backdrop-blur-md z-30 flex items-center justify-between px-8 shrink-0">
      <div className="flex flex-col">
        <h1 className="text-base font-bold tracking-tight text-slate-800 dark:text-slate-100 font-sans">
          {getPageTitle()}
        </h1>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold font-sans uppercase tracking-wider">
          Smart Transport Control
        </span>
      </div>

      <div className="flex items-center gap-5">
        {/* Role indicator */}
        {user?.role && (
          <Badge variant="info" className="text-[10px] py-1 px-3.5">
            {getRoleLabel(user.role)}
          </Badge>
        )}

        {/* User Card info */}
        <div className="flex items-center gap-3 pl-5 border-l border-slate-200/50 dark:border-slate-800/80">
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 font-sans leading-none">
              {user?.name || 'Guest User'}
            </span>
            <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 font-sans mt-0.5 leading-none">
              {user?.email || 'not logged in'}
            </span>
          </div>

          <div className="w-8.5 h-8.5 rounded-xl bg-primary-light/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs select-none">
            {user?.name ? user.name.split(' ').map(n=>n[0]).join('') : 'GU'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
