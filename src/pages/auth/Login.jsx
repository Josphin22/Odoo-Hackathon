import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import gsap from 'gsap';

const Login = () => {
  const { login, error, user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const formRef = useRef(null);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      email: localStorage.getItem('transitops_remembered_email') || '',
      password: 'password123',
      rememberMe: !!localStorage.getItem('transitops_remembered_email')
    }
  });

  // GSAP animation for floating login box entry
  useEffect(() => {
    gsap.fromTo(formRef.current,
      { opacity: 0, scale: 0.96, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(1.2)' }
    );
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const onSubmit = async (data) => {
    try {
      const loggedInUser = await login(data.email, data.password, data.rememberMe);
      showSuccess(`Welcome back, ${loggedInUser.name}!`);
      navigate('/dashboard');
    } catch (err) {
      showError(err.message || 'Authentication failed.');
    }
  };

  // Pre-seed credentials for demo quick access
  const handleQuickSelect = (role) => {
    const roles = {
      FLEET_MANAGER: { email: 'manager@transitops.com', password: 'password123' },
      DRIVER: { email: 'driver@transitops.com', password: 'password123' },
      SAFETY_OFFICER: { email: 'safety@transitops.com', password: 'password123' },
      FINANCIAL_ANALYST: { email: 'finance@transitops.com', password: 'password123' }
    };
    const creds = roles[role];
    if (creds) {
      setValue('email', creds.email);
      setValue('password', creds.password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden relative p-4">
      {/* Background aesthetic decorative gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/20 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-secondary/15 blur-[150px] pointer-events-none" />

      <div 
        ref={formRef}
        className="w-full max-w-md bg-slate-800/40 border border-slate-700/30 rounded-3xl shadow-glass backdrop-blur-xl p-8 flex flex-col gap-6"
      >
        {/* Title */}
        <div className="text-center flex flex-col gap-2">
          <div className="w-12 h-12 bg-primary text-white font-extrabold text-2xl flex items-center justify-center rounded-2xl mx-auto shadow-lg shadow-primary/20">
            T
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white font-sans mt-3">
            Sign In to TransitOps
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            Smart Transport Operations & Dispatch
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4.5">
          <Input
            label="Email Address"
            placeholder="e.g. manager@transitops.com"
            icon={Mail}
            type="email"
            error={errors.email?.message}
            className="bg-slate-900/50 border-slate-700/50 text-white focus:border-primary focus:ring-primary/10"
            {...register('email', { required: 'Email address is required.' })}
          />

          <Input
            label="Password"
            placeholder="••••••••"
            icon={Lock}
            type="password"
            error={errors.password?.message}
            className="bg-slate-900/50 border-slate-700/50 text-white focus:border-primary focus:ring-primary/10"
            {...register('password', { required: 'Password is required.' })}
          />

          {/* Remember me check */}
          <div className="flex items-center justify-between py-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-700 bg-slate-900/50 text-primary focus:ring-primary/30"
                {...register('rememberMe')}
              />
              <span className="text-xs font-semibold text-slate-400 font-sans">
                Remember my email
              </span>
            </label>
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full py-3"
            loading={isSubmitting}
          >
            Authenticate
          </Button>
        </form>

        {/* Demo Fast Access presets */}
        <div className="border-t border-slate-700/40 pt-5 flex flex-col gap-3">
          <span className="text-[10px] font-semibold text-slate-400 font-sans uppercase tracking-wider text-center">
            Demo Credentials Pre-selection
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickSelect('FLEET_MANAGER')}
              className="px-3 py-2 rounded-xl bg-slate-900/40 hover:bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700/30 text-center transition-all cursor-pointer"
            >
              💼 Fleet Manager
            </button>
            <button
              onClick={() => handleQuickSelect('DRIVER')}
              className="px-3 py-2 rounded-xl bg-slate-900/40 hover:bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700/30 text-center transition-all cursor-pointer"
            >
              🚛 Trip Operator
            </button>
            <button
              onClick={() => handleQuickSelect('SAFETY_OFFICER')}
              className="px-3 py-2 rounded-xl bg-slate-900/40 hover:bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700/30 text-center transition-all cursor-pointer"
            >
              🛡️ Safety Officer
            </button>
            <button
              onClick={() => handleQuickSelect('FINANCIAL_ANALYST')}
              className="px-3 py-2 rounded-xl bg-slate-900/40 hover:bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700/30 text-center transition-all cursor-pointer"
            >
              📊 Financial Analyst
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
