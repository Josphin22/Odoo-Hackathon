import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import { ScrollText, LogIn, Monitor, ShieldAlert, Clock, RefreshCw } from 'lucide-react';

const AuditHistory = () => {
  const [activeTab, setActiveTab] = useState('admin'); // 'admin' or 'login'
  const [auditLogs, setAuditLogs] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [activeTab]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      if (activeTab === 'admin') {
        const res = await axiosInstance.get('/admin/audit-logs');
        setAuditLogs(res.data || []);
      } else {
        const res = await axiosInstance.get('/admin/login-history');
        setLoginHistory(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-sans text-slate-800 dark:text-slate-100">Audit Center</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Enterprise security ledger mapping administrative actions and user login timelines.</p>
        </div>
        <button 
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs font-semibold cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200/60 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
            activeTab === 'admin' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ScrollText size={16} />
          Administrative Logs
        </button>
        <button
          onClick={() => setActiveTab('login')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
            activeTab === 'login' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <LogIn size={16} />
          Login & Session History
        </button>
      </div>

      {/* Grid List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {activeTab === 'admin' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-200/60 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase">
                  <th className="p-4">Admin Email</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Target User</th>
                  <th className="p-4">Change Log</th>
                  <th className="p-4">IP & Browser</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/80 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400">Loading audit log lines...</td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400">No admin logs recorded.</td>
                  </tr>
                ) : auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                    <td className="p-4">
                      <div className="font-semibold text-slate-850 dark:text-slate-200">{log.adminName}</div>
                      <div className="text-xs text-slate-500">{log.adminEmail}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">{log.targetUser || '-'}</td>
                    <td className="p-4 max-w-[280px]">
                      {log.oldValue && (
                        <div className="text-xs text-rose-500 line-through truncate" title={log.oldValue}>
                          {log.oldValue}
                        </div>
                      )}
                      {log.newValue && (
                        <div className="text-xs text-emerald-600 font-medium truncate mt-0.5" title={log.newValue}>
                          {log.newValue}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-mono font-medium text-slate-600 dark:text-slate-450">{log.ipAddress}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[120px]" title={log.browser}>{log.browser}</div>
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                        log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-200/60 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase">
                  <th className="p-4">Username (Email)</th>
                  <th className="p-4">Login Time</th>
                  <th className="p-4">Logout Time</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4">Device & OS</th>
                  <th className="p-4">Timeline Context</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/80 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400">Loading session timeline logs...</td>
                  </tr>
                ) : loginHistory.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400">No session history found.</td>
                  </tr>
                ) : loginHistory.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{log.username}</td>
                    <td className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {new Date(log.loginTime).toLocaleString()}
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {log.logoutTime ? new Date(log.logoutTime).toLocaleString() : '-'}
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-600 dark:text-slate-400">{log.ipAddress}</td>
                    <td className="p-4">
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Monitor size={12} /> {log.operatingSystem || 'PC'}
                      </div>
                      <div className="text-[10px] text-slate-400">{log.browser}</div>
                    </td>
                    <td className="p-4 text-xs text-slate-500 dark:text-slate-450">{log.logoutReason || 'Active Session'}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                        log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditHistory;
