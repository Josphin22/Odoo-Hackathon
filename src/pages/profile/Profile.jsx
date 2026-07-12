import React from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useForm } from 'react-hook-form';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Shield, User, Key, UserCheck } from 'lucide-react';
import { Card } from '../../components/common/Card';

const Profile = () => {
  const { user, updateProfile, login } = useAuth();
  const { showSuccess, showError } = useNotification();

  const { register: registerProf, handleSubmit: handleSubmitProf, formState: { errors: errorsProf, isSubmitting: isSubmittingProf } } = useForm({
    defaultValues: {
      name: user?.name || '',
      password: ''
    }
  });

  const handleProfileSubmit = async (data) => {
    try {
      await updateProfile(data);
      showSuccess('Profile details saved successfully!');
    } catch (err) {
      showError(err.message || 'Failed to update profile.');
    }
  };

  // Quick Role Simulator Switcher!
  const simulateRoleSwitch = async (role) => {
    const roles = {
      FLEET_MANAGER: { email: 'manager@transitops.com', password: 'password123' },
      DRIVER: { email: 'driver@transitops.com', password: 'password123' },
      SAFETY_OFFICER: { email: 'safety@transitops.com', password: 'password123' },
      FINANCIAL_ANALYST: { email: 'finance@transitops.com', password: 'password123' }
    };
    const creds = roles[role];
    if (creds) {
      try {
        await login(creds.email, creds.password, false);
        showSuccess(`Simulating account role: ${role}`);
      } catch (err) {
        showError('Simulation switch failed.');
      }
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'FLEET_MANAGER': return 'Fleet Manager';
      case 'DRIVER': return 'Operator / Driver';
      case 'SAFETY_OFFICER': return 'Safety Officer';
      case 'FINANCIAL_ANALYST': return 'Financial Analyst';
      default: return role;
    }
  };

  return (
    <PageWrapper>
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/40 dark:border-slate-800/50 pb-5">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 font-sans">
            Account Management & Simulator
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-sans mt-0.5">
            Modify profile details and swap session roles to inspect RBAC privileges in real-time
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="flex flex-col gap-6">
            <div className="flex items-center gap-4.5 border-b border-slate-200/40 dark:border-slate-800/40 pb-5">
              <div className="w-14 h-14 bg-primary-light/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-lg rounded-2xl select-none">
                {user?.name ? user.name.split(' ').map(n=>n[0]).join('') : 'GU'}
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 font-sans text-base leading-none">
                  {user?.name || 'Guest User'}
                </h3>
                <span className="text-xs text-slate-400 font-sans">
                  Current Session: {user?.email}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitProf(handleProfileSubmit)} className="flex flex-col gap-4.5">
              <Input
                label="Full Display Name"
                placeholder="e.g. Marcus Vance"
                icon={User}
                error={errorsProf.name?.message}
                {...registerProf('name', { required: 'Name is required.' })}
              />

              <Input
                label="Change Password"
                placeholder="Leave blank to keep current"
                icon={Key}
                type="password"
                error={errorsProf.password?.message}
                {...registerProf('password')}
              />

              <div className="flex items-center justify-end border-t border-slate-200/40 dark:border-slate-800/40 pt-4.5 mt-2">
                <Button type="submit" variant="primary" size="sm" loading={isSubmittingProf}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* RBAC Simulator Box */}
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-5 border border-primary/25 dark:border-primary/15 bg-primary/5">
            <div className="flex items-center gap-3 border-b border-slate-200/40 dark:border-slate-800/40 pb-4">
              <Shield size={20} className="text-primary" />
              <div className="flex flex-col">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-xs font-sans uppercase tracking-wider">
                  RBAC Role Simulator
                </h3>
                <span className="text-[9px] text-slate-400 font-sans leading-none">
                  Quick-swap context permissions
                </span>
              </div>
            </div>

            <div className="p-3 bg-white/40 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/80 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
              <UserCheck size={24} className="text-primary mb-1" />
              <span className="text-[10px] font-bold text-slate-400 font-sans uppercase tracking-wider">Active Credentials</span>
              <Badge variant="info">{getRoleLabel(user?.role)}</Badge>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => simulateRoleSwitch('FLEET_MANAGER')}
                className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex items-center justify-between ${
                  user?.role === 'FLEET_MANAGER'
                    ? 'bg-primary border-primary text-white shadow-sm shadow-primary/20'
                    : 'bg-white dark:bg-slate-850 border-slate-200/45 dark:border-slate-800/40 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                💼 Fleet Manager
                {user?.role === 'FLEET_MANAGER' && <span className="text-[9px] uppercase font-black">active</span>}
              </button>
              <button
                onClick={() => simulateRoleSwitch('DRIVER')}
                className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex items-center justify-between ${
                  user?.role === 'DRIVER'
                    ? 'bg-primary border-primary text-white shadow-sm shadow-primary/20'
                    : 'bg-white dark:bg-slate-850 border-slate-200/45 dark:border-slate-800/40 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                🚛 Trip Operator (Driver)
                {user?.role === 'DRIVER' && <span className="text-[9px] uppercase font-black">active</span>}
              </button>
              <button
                onClick={() => simulateRoleSwitch('SAFETY_OFFICER')}
                className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex items-center justify-between ${
                  user?.role === 'SAFETY_OFFICER'
                    ? 'bg-primary border-primary text-white shadow-sm shadow-primary/20'
                    : 'bg-white dark:bg-slate-850 border-slate-200/45 dark:border-slate-800/40 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                🛡️ Safety Officer
                {user?.role === 'SAFETY_OFFICER' && <span className="text-[9px] uppercase font-black">active</span>}
              </button>
              <button
                onClick={() => simulateRoleSwitch('FINANCIAL_ANALYST')}
                className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex items-center justify-between ${
                  user?.role === 'FINANCIAL_ANALYST'
                    ? 'bg-primary border-primary text-white shadow-sm shadow-primary/20'
                    : 'bg-white dark:bg-slate-850 border-slate-200/45 dark:border-slate-800/40 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                📊 Financial Analyst
                {user?.role === 'FINANCIAL_ANALYST' && <span className="text-[9px] uppercase font-black">active</span>}
              </button>
            </div>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Profile;
