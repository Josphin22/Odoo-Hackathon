import React, { useEffect, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { useDashboardStore } from '../../store/dashboardStore';
import Loader from '../../components/common/Loader';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { exportToCSV } from '../../utils/exportCSV';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Download, Landmark, Fuel, Percent, SlidersHorizontal } from 'lucide-react';

const Reports = () => {
  const { roi, fuelEfficiency, fetchDashboardData, loading } = useDashboardStore();
  const [activeTab, setActiveTab] = useState('roi');

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading || !roi.length) {
    return <Loader fullPage message="Compiling reports matrices..." />;
  }

  const handleExport = () => {
    if (activeTab === 'roi') {
      const dataToExport = roi.map(({ name, registrationNumber, revenue, operationalCost, acquisitionCost, roi }) => ({
        'Vehicle Name': name,
        'Plate Number': registrationNumber,
        'Revenue Generated ($)': revenue,
        'Operational Cost ($)': operationalCost,
        'Acquisition Price ($)': acquisitionCost,
        'ROI (%)': roi
      }));
      exportToCSV(dataToExport, 'Fleet_ROI_Report.csv');
    } else {
      const dataToExport = fuelEfficiency.map(({ name, registrationNumber, distance, fuelUsed, efficiency }) => ({
        'Vehicle Name': name,
        'Plate Number': registrationNumber,
        'Distance Traveled (km)': distance,
        'Fuel Consumed (L)': fuelUsed,
        'Fuel Efficiency (km/L)': efficiency
      }));
      exportToCSV(dataToExport, 'Fleet_Fuel_Efficiency_Report.csv');
    }
  };

  const roiColumns = [
    { key: 'registrationNumber', label: 'Plate Number', sortable: true, className: 'font-mono text-xs' },
    { key: 'name', label: 'Vehicle Model', sortable: true },
    { key: 'revenue', label: 'Estimated Revenue', sortable: true, render: (val) => `$${val.toLocaleString()}` },
    { key: 'operationalCost', label: 'Operational Cost', sortable: true, render: (val) => `$${val.toLocaleString()}` },
    { key: 'acquisitionCost', label: 'Acquisition Price', sortable: true, render: (val) => `$${val.toLocaleString()}` },
    { 
      key: 'roi', 
      label: 'Vehicle ROI', 
      sortable: true,
      render: (val) => (
        <span className={`font-bold ${val >= 10 ? 'text-emerald-500' : val >= 0 ? 'text-indigo-500' : 'text-rose-500'}`}>
          {val}%
        </span>
      )
    }
  ];

  const fuelColumns = [
    { key: 'registrationNumber', label: 'Plate Number', sortable: true, className: 'font-mono text-xs' },
    { key: 'name', label: 'Vehicle Model', sortable: true },
    { key: 'distance', label: 'Distance Traveled', sortable: true, render: (val) => `${val.toLocaleString()} km` },
    { key: 'fuelUsed', label: 'Fuel Consumed', sortable: true, render: (val) => `${val.toLocaleString()} L` },
    { 
      key: 'efficiency', 
      label: 'Fuel Efficiency', 
      sortable: true,
      render: (val) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {val} km / Liter
        </span>
      )
    }
  ];

  return (
    <PageWrapper>
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/40 dark:border-slate-800/50 pb-5">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 font-sans">
            Operational Intelligence Reports
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-sans mt-0.5">
            Audit vehicle investment metrics, fuel mileage performance, and export raw logs
          </p>
        </div>
        <Button variant="primary" size="sm" icon={Download} onClick={handleExport}>
          Export CSV
        </Button>
      </div>

      {/* Tabs list controls */}
      <div className="flex items-center gap-3 bg-white/30 dark:bg-slate-900/10 border border-slate-200/40 dark:border-slate-800/80 p-2 rounded-2xl backdrop-blur-md shadow-premium w-fit select-none">
        <button
          onClick={() => setActiveTab('roi')}
          className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer ${
            activeTab === 'roi' 
              ? 'bg-primary text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850/50'
          }`}
        >
          <Landmark size={14} />
          Vehicle Return on Investment (ROI)
        </button>
        <button
          onClick={() => setActiveTab('fuel')}
          className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer ${
            activeTab === 'fuel' 
              ? 'bg-primary text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850/50'
          }`}
        >
          <Fuel size={14} />
          Fuel Efficiency Metrics
        </button>
      </div>

      {/* Main Charts & Table section based on active tab */}
      {activeTab === 'roi' ? (
        <div className="flex flex-col gap-6 animate-slide-up">
          {/* Chart Panel */}
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200/40 dark:border-slate-800/70 p-5 rounded-2xl shadow-premium backdrop-blur-md flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 font-sans">
              ROI Benchmark Analysis
            </h3>
            <div className="h-64 w-full text-xs font-sans">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roi} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(203, 213, 225, 0.25)" />
                  <XAxis dataKey="registrationNumber" tickLine={false} axisLine={false} stroke="#94a3b8" />
                  <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="roi" fill="#4F46E5" name="ROI (%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Data Table Grid */}
          <Table
            columns={roiColumns}
            data={roi}
            pageSize={5}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-6 animate-slide-up">
          {/* Chart Panel */}
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200/40 dark:border-slate-800/70 p-5 rounded-2xl shadow-premium backdrop-blur-md flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 font-sans">
              Fuel Efficiency Log (km / Liter)
            </h3>
            <div className="h-64 w-full text-xs font-sans">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fuelEfficiency} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(203, 213, 225, 0.25)" />
                  <XAxis dataKey="registrationNumber" tickLine={false} axisLine={false} stroke="#94a3b8" />
                  <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="efficiency" stroke="#EC4899" strokeWidth={2.5} name="Efficiency (km/L)" dot={{ strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Data Table Grid */}
          <Table
            columns={fuelColumns}
            data={fuelEfficiency}
            pageSize={5}
          />
        </div>
      )}
    </PageWrapper>
  );
};

export default Reports;
