import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import Button from '../../components/common/Button';
import PageWrapper from '../../components/layout/PageWrapper';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper className="items-center justify-center min-h-[75vh]">
      <div className="max-w-md text-center flex flex-col items-center gap-5 glassmorphism dark:glassmorphism-dark p-8 rounded-2xl shadow-glass">
        <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-200/50 dark:border-rose-900/30">
          <ShieldAlert size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-sans">
          Access Denied
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
          Your current account role does not have authorization clearance to view this module. Please contact a system administrator if this is an error.
        </p>
        <div className="flex gap-3 mt-4 border-t border-slate-200/40 dark:border-slate-800/40 pt-6 w-full justify-center">
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/dashboard')}>
            Dashboard View
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Unauthorized;
