import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import { Settings, Save, AlertCircle } from 'lucide-react';

const CompanySettings = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    logo: '',
    gstNumber: '',
    panNumber: '',
    transportLicenseNo: '',
    address: '',
    phoneNumber: '',
    email: '',
    website: '',
    workingHours: '',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    fiscalYear: '',
    defaultFuelPrice: 0.0,
    defaultMaintenanceInterval: 5000
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/settings');
      if (res.data) {
        setFormData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.put('/settings', formData);
      alert('Company Profile saved successfully.');
      if (res.data) setFormData(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update Company Settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-sans text-slate-800 dark:text-slate-100">Company Profile Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Singleton transport company configuration settings. Used for invoicing, logs, and report exports.</p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50 rounded-2xl p-4 text-amber-800 dark:text-amber-300 flex items-start gap-3 text-sm">
        <AlertCircle className="shrink-0 mt-0.5" size={16} />
        <div>
          <span className="font-semibold">Singleton Rule Enforcement:</span> TransitOps only supports one primary organization settings profile. Creating duplicate profiles is blocked by database referential identity.
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-sm font-bold text-slate-450 uppercase tracking-wider mb-1">Company Identity</h2>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company Name</label>
            <input 
              type="text" required
              value={formData.companyName}
              onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company Website</label>
            <input 
              type="text"
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">GST Number</label>
            <input 
              type="text"
              value={formData.gstNumber}
              onChange={(e) => setFormData({...formData, gstNumber: e.target.value})}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">PAN Number</label>
            <input 
              type="text"
              value={formData.panNumber}
              onChange={(e) => setFormData({...formData, panNumber: e.target.value})}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Transport License No</label>
            <input 
              type="text"
              value={formData.transportLicenseNo}
              onChange={(e) => setFormData({...formData, transportLicenseNo: e.target.value})}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fiscal Year</label>
            <input 
              type="text" placeholder="e.g. 2026-2027"
              value={formData.fiscalYear}
              onChange={(e) => setFormData({...formData, fiscalYear: e.target.value})}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="col-span-1 md:col-span-2 border-t border-slate-200/50 dark:border-slate-800 pt-4 mt-2">
            <h2 className="text-sm font-bold text-slate-450 uppercase tracking-wider mb-1">Contact & Address</h2>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Number</label>
            <input 
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company Email</label>
            <input 
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Office Address</label>
            <textarea 
              rows="3"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="col-span-1 md:col-span-2 border-t border-slate-200/50 dark:border-slate-800 pt-4 mt-2">
            <h2 className="text-sm font-bold text-slate-450 uppercase tracking-wider mb-1">Operations & Defaults</h2>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Timezone</label>
            <select 
              value={formData.timezone}
              onChange={(e) => setFormData({...formData, timezone: e.target.value})}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 text-sm focus:outline-none"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="UTC">Coordinated Universal Time (UTC)</option>
              <option value="America/New_York">America/New_York (EST)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Default Base Currency</label>
            <select 
              value={formData.currency}
              onChange={(e) => setFormData({...formData, currency: e.target.value})}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 text-sm focus:outline-none"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Default Fuel Price (per Liter)</label>
            <input 
              type="number" step="0.01"
              value={formData.defaultFuelPrice}
              onChange={(e) => setFormData({...formData, defaultFuelPrice: parseFloat(e.target.value)})}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Default Maintenance Odometer Interval (km)</label>
            <input 
              type="number"
              value={formData.defaultMaintenanceInterval}
              onChange={(e) => setFormData({...formData, defaultMaintenanceInterval: parseInt(e.target.value)})}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200/50 dark:border-slate-800">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 shadow-md cursor-pointer transition-all disabled:opacity-50"
          >
            <Save size={16} />
            Save Profile Configurations
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanySettings;
