import React, { useEffect } from 'react';
import { useDashboardStore } from '../../store/dashboardStore';
import PageWrapper from '../../components/layout/PageWrapper';
import { MetricCard } from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import { 
  Truck, Route, Wrench, Users, Percent, 
  MapPin, SlidersHorizontal, AlertCircle 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend 
} from 'recharts';
import { animateStaggeredCards, animateCounter } from '../../animations/cardAnimation';
import Select from '../../components/common/Select';
import { useForm } from 'react-hook-form';

const Dashboard = () => {
  const { kpis, expenses, fetchDashboardData, loading } = useDashboardStore();
  const { register, watch } = useForm({
    defaultValues: {
      region: '',
      vehicleType: '',
      status: ''
    }
  });

  const filterRegion = watch('region');
  const filterType = watch('vehicleType');
  const filterStatus = watch('status');

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Trigger animations when KPIs load
  useEffect(() => {
    if (kpis && !loading) {
      // Staggered dashboard cards
      animateStaggeredCards('.kpi-card');
      
      // Animate counters
      animateCounter('cnt-total-v', kpis.totalVehicles);
      animateCounter('cnt-utilization', kpis.utilization);
      animateCounter('cnt-active-trips', kpis.activeTrips);
      animateCounter('cnt-drivers-duty', kpis.driversOnDuty);
    }
  }, [kpis, loading]);

  if (loading || !kpis) {
    return <Loader fullPage message="Assembling operational metrics..." />;
  }

  // Pre-seed clean charts mock data based on operational expenses
  const expenseData = [
    { name: 'Jan', Fuel: 2400, Maintenance: 1200, Tolls: 400 },
    { name: 'Feb', Fuel: 2800, Maintenance: 1800, Tolls: 500 },
    { name: 'Mar', Fuel: 3200, Maintenance: 1400, Tolls: 600 },
    { name: 'Apr', Fuel: 2700, Maintenance: 2000, Tolls: 450 },
    { name: 'May', Fuel: 3100, Maintenance: 1600, Tolls: 550 },
    { name: 'Jun', Fuel: 4000, Maintenance: 2400, Tolls: 700 },
    { name: 'Jul', Fuel: 4200, Maintenance: 1900, Tolls: 650 }
  ];

  const utilizationData = [
    { name: 'Mon', utilization: 68 },
    { name: 'Tue', utilization: 72 },
    { name: 'Wed', utilization: 85 },
    { name: 'Thu', utilization: 79 },
    { name: 'Fri', utilization: 88 },
    { name: 'Sat', utilization: 55 },
    { name: 'Sun', utilization: 42 }
  ];

  return (
    <PageWrapper>
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4.5 bg-white/30 dark:bg-slate-900/10 border border-slate-200/40 dark:border-slate-800/80 p-4.5 rounded-2xl backdrop-blur-md shadow-premium">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
          <SlidersHorizontal size={16} className="text-primary" />
          <span className="text-xs font-bold font-sans uppercase tracking-wider">
            Live Filters
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto md:min-w-[500px]">
          <Select
            placeholder="All Regions"
            options={[
              { value: 'North', label: 'North Region' },
              { value: 'South', label: 'South Region' },
              { value: 'East', label: 'East Region' },
              { value: 'West', label: 'West Region' }
            ]}
            className="bg-white dark:bg-slate-800"
            {...register('region')}
          />
          <Select
            placeholder="All Vehicle Types"
            options={[
              { value: 'Heavy Truck', label: 'Heavy Truck' },
              { value: 'Semi-Trailer', label: 'Semi-Trailer' },
              { value: 'Light Van', label: 'Light Van' },
              { value: 'Box Truck', label: 'Box Truck' }
            ]}
            className="bg-white dark:bg-slate-800"
            {...register('vehicleType')}
          />
          <Select
            placeholder="All Statuses"
            options={[
              { value: 'Available', label: 'Available' },
              { value: 'On Trip', label: 'On Trip' },
              { value: 'In Shop', label: 'In Shop' },
              { value: 'Retired', label: 'Retired' }
            ]}
            className="bg-white dark:bg-slate-800"
            {...register('status')}
          />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          className="kpi-card"
          title="Active Fleet Size"
          value={kpis.totalVehicles}
          valueId="cnt-total-v"
          icon={Truck}
          trend="8.3%"
          trendDirection="up"
        />
        <MetricCard
          className="kpi-card"
          title="Fleet Utilization"
          value={`${kpis.utilization}%`}
          valueId="cnt-utilization"
          icon={Percent}
          trend="12.1%"
          trendDirection="up"
        />
        <MetricCard
          className="kpi-card"
          title="Active Missions"
          value={kpis.activeTrips}
          valueId="cnt-active-trips"
          icon={Route}
          trend="15.4%"
          trendDirection="up"
        />
        <MetricCard
          className="kpi-card"
          title="Drivers Active"
          value={kpis.driversOnDuty}
          valueId="cnt-drivers-duty"
          icon={Users}
          trend="Neutral"
          trendDirection="neutral"
        />
      </div>

      {/* Analytics Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost Analysis Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/50 border border-slate-200/40 dark:border-slate-800/70 p-5 rounded-2xl shadow-premium backdrop-blur-md flex flex-col gap-4">
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 font-sans">
              Operational Expense Ledger
            </h3>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans mt-0.5">
              Accumulated costs for fuel, maintenance, and tolls
            </span>
          </div>
          <div className="h-72 w-full text-xs font-sans">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(203, 213, 225, 0.25)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#94a3b8" />
                <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" />
                <Tooltip 
                  cursor={{ fill: 'rgba(79, 70, 229, 0.05)' }} 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid rgba(226, 232, 240, 0.5)',
                    background: 'rgba(255, 255, 255, 0.95)',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)'
                  }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Fuel" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Maintenance" fill="#EC4899" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Tolls" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Utilization Gauge */}
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200/40 dark:border-slate-800/70 p-5 rounded-2xl shadow-premium backdrop-blur-md flex flex-col gap-4">
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 font-sans">
              Daily Fleet Deployment (%)
            </h3>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans mt-0.5">
              Weekly average active deployments
            </span>
          </div>
          <div className="h-72 w-full text-xs font-sans">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={utilizationData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(203, 213, 225, 0.25)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#94a3b8" />
                <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="utilization" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUtil)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Critical Status Alerts panel */}
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200/40 dark:border-slate-800/70 p-5 rounded-2xl shadow-premium backdrop-blur-md flex flex-col gap-4">
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 font-sans">
            Critical Dispatch Alerts
          </h3>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans mt-0.5">
            System generated notifications concerning driver compliance and vehicle safety
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {kpis.inShopVehicles > 0 && (
            <div className="flex items-center gap-3.5 p-4.5 rounded-xl border border-amber-200/50 bg-amber-500/5 dark:bg-amber-950/10 text-amber-700 dark:text-amber-400 font-sans text-xs">
              <AlertCircle size={18} className="shrink-0 animate-subtle-pulse" />
              <div className="flex-1">
                <span className="font-bold">Maintenance Lock:</span> {kpis.inShopVehicles} fleet vehicles are currently marked <span className="underline">In Shop</span> and excluded from dispatch pools.
              </div>
            </div>
          )}

          <div className="flex items-center gap-3.5 p-4.5 rounded-xl border border-rose-200/50 bg-rose-500/5 dark:bg-rose-950/10 text-rose-700 dark:text-rose-400 font-sans text-xs">
            <AlertCircle size={18} className="shrink-0 animate-subtle-pulse" />
            <div className="flex-1">
              <span className="font-bold">Safety Alert:</span> Driver profile <span className="font-semibold underline">John Doe</span> contains an <span className="font-bold uppercase text-rose-600 dark:text-rose-500">Expired License</span> and cannot be assigned to trips.
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
