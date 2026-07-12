import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Truck, Users, Route, Wrench, 
  Fuel, Wallet, FileText, User, LogOut, Sun, Moon, 
  Menu, ChevronLeft, Shield, ScrollText, Settings, UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import gsap from 'gsap';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  // Route declarations with permissions
  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['*'] },
    { label: 'Employees', path: '/admin/employees', icon: UserCheck, roles: ['ADMIN'] },
    { label: 'Roles Matrix', path: '/admin/roles', icon: Shield, roles: ['ADMIN'] },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: ScrollText, roles: ['ADMIN'] },
    { label: 'Company Profile', path: '/admin/company-settings', icon: Settings, roles: ['ADMIN'] },
    { label: 'Vehicles', path: '/vehicles', icon: Truck, roles: ['FLEET_MANAGER', 'SAFETY_OFFICER'] },
    { label: 'Drivers', path: '/drivers', icon: Users, roles: ['FLEET_MANAGER', 'SAFETY_OFFICER'] },
    { label: 'Trips', path: '/trips', icon: Route, roles: ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'DISPATCHER'] },
    { label: 'Maintenance', path: '/maintenance', icon: Wrench, roles: ['FLEET_MANAGER'] },
    { label: 'Fuel Logs', path: '/fuel', icon: Fuel, roles: ['FLEET_MANAGER', 'DRIVER', 'FINANCIAL_ANALYST'] },
    { label: 'Expenses', path: '/expenses', icon: Wallet, roles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST'] },
    { label: 'Reports', path: '/reports', icon: FileText, roles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST'] },
    { label: 'Profile', path: '/profile', icon: User, roles: ['*'] }
  ];

  // Filter items based on active role
  const userRole = user?.role || 'DRIVER';
  const filteredItems = menuItems.filter(item => 
    item.roles.includes('*') || item.roles.includes(userRole) || userRole === 'ADMIN'
  );

  // GSAP animation for collapsing/expanding sidebar
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (isCollapsed) {
      gsap.to(sidebar, { width: 80, duration: 0.35, ease: 'power3.inOut' });
      // Hide labels
      gsap.to('.sidebar-label', { opacity: 0, x: -10, duration: 0.15, display: 'none' });
    } else {
      gsap.to(sidebar, { width: 260, duration: 0.35, ease: 'power3.inOut' });
      // Show labels
      gsap.to('.sidebar-label', { display: 'block', opacity: 1, x: 0, duration: 0.25, delay: 0.1, ease: 'power2.out' });
    }
  }, [isCollapsed]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside 
      ref={sidebarRef}
      className="bg-sidebar-light dark:bg-sidebar-dark border-r border-slate-200/50 dark:border-slate-900 flex flex-col justify-between h-screen sticky top-0 z-40 overflow-hidden w-[260px]"
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-200/40 dark:border-slate-900/50 shrink-0 h-18">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold font-sans">
            T
          </div>
          <span className="sidebar-label font-bold text-lg text-slate-800 dark:text-slate-100 tracking-tight font-sans">
            TransitOps
          </span>
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 cursor-pointer"
        >
          {isCollapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav List */}
      <nav ref={listRef} className="flex-1 py-4 px-3 overflow-y-auto scrollbar-hidden flex flex-col gap-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all group relative cursor-pointer ${
                  isActive 
                    ? 'bg-primary text-white shadow-sm shadow-primary/20' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span className="sidebar-label font-sans font-medium whitespace-nowrap">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Controls */}
      <div className="p-3 border-t border-slate-200/40 dark:border-slate-900/50 shrink-0 flex flex-col gap-1.5">
        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-200 w-full text-left cursor-pointer"
        >
          {darkMode ? <Sun size={18} className="shrink-0" /> : <Moon size={18} className="shrink-0" />}
          <span className="sidebar-label font-sans font-medium whitespace-nowrap">
            {darkMode ? 'Light Theme' : 'Dark Theme'}
          </span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 w-full text-left cursor-pointer"
        >
          <LogOut size={18} className="shrink-0" />
          <span className="sidebar-label font-sans font-medium whitespace-nowrap">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
