import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import { Shield, Plus, Info, Check, X, ShieldAlert } from 'lucide-react';

const RolePermissionMatrix = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState([]); // List of string representation e.g. ["VEHICLES_READ"]
  const [roleDescription, setRoleDescription] = useState('');
  const [roleName, setRoleName] = useState('');
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  // Matrix Layout
  const modules = [
    { key: 'DASHBOARD', label: 'Dashboard' },
    { key: 'VEHICLES', label: 'Vehicles' },
    { key: 'DRIVERS', label: 'Drivers' },
    { key: 'TRIPS', label: 'Trips' },
    { key: 'FUEL', label: 'Fuel logs' },
    { key: 'EXPENSES', label: 'Expenses' },
    { key: 'REPORTS', label: 'Reports' },
    { key: 'USERS', label: 'Users/Employees' },
    { key: 'ROLES', label: 'Roles Matrix' },
    { key: 'AUDIT_LOGS', label: 'Audit Logs' }
  ];

  const actions = [
    { key: 'READ', label: 'Read' },
    { key: 'CREATE', label: 'Create' },
    { key: 'UPDATE', label: 'Update' },
    { key: 'DELETE', label: 'Delete' },
    { key: 'EXPORT', label: 'Export' },
    { key: 'APPROVE', label: 'Approve' }
  ];

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axiosInstance.get('/roles');
      setRoles(response.data || []);
      if (response.data && response.data.length > 0) {
        selectRole(response.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectRole = (role) => {
    setSelectedRole(role);
    setPermissions(role.permissions || []);
    setRoleDescription(role.description || '');
    setRoleName(role.name || '');
  };

  const handleCellClick = (module, action) => {
    if (selectedRole?.name === 'ADMIN') return; // ADMIN has all permissions, cannot be changed
    
    const permKey = `${module}_${action}`;
    if (permissions.includes(permKey)) {
      setPermissions(permissions.filter(p => p !== permKey));
    } else {
      setPermissions([...permissions, permKey]);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    try {
      const req = {
        name: roleName,
        description: roleDescription,
        permissions: permissions
      };
      const response = await axiosInstance.put(`/roles/${selectedRole.id}`, req);
      alert('Role permissions updated successfully.');
      fetchRoles();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update permissions');
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      const req = {
        name: newRoleName,
        description: newRoleDesc,
        permissions: []
      };
      await axiosInstance.post('/roles', req);
      setShowAddRoleModal(false);
      setNewRoleName('');
      setNewRoleDesc('');
      fetchRoles();
      alert('Role created successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create role');
    }
  };

  const handleDeleteRole = async (id) => {
    if (!window.confirm('Are you sure you want to delete this custom role? This action is permanent.')) return;
    try {
      await axiosInstance.delete(`/roles/${id}`);
      fetchRoles();
      alert('Role deleted.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete role');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-sans text-slate-800 dark:text-slate-100">Role Permission Matrix</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Map security groups to permission structures dynamically.</p>
        </div>
        <button 
          onClick={() => setShowAddRoleModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 shadow-md cursor-pointer transition-all"
        >
          <Plus size={16} />
          Create Custom Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Roles List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Available Roles</h2>
          <div className="flex flex-col gap-1.5">
            {roles.map(r => (
              <button
                key={r.id}
                onClick={() => selectRole(r)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-medium transition-all cursor-pointer ${
                  selectedRole?.id === r.id 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield size={16} />
                  <span>{r.name}</span>
                </div>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                  {r.numberOfUsers} user{r.numberOfUsers !== 1 ? 's' : ''}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Permission Grid Matrix */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-start border-b border-slate-200/40 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold font-sans text-slate-800 dark:text-slate-100">
                Permissions for <span className="text-primary">{selectedRole?.name}</span>
              </h2>
              {selectedRole?.isSystemRole && (
                <span className="inline-flex items-center gap-1 mt-1 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded-md font-semibold">
                  <Info size={12} /> System Protected Role
                </span>
              )}
            </div>
            <button
              onClick={handleSavePermissions}
              disabled={selectedRole?.name === 'ADMIN'}
              className={`px-5 py-2 rounded-xl text-sm font-semibold shadow-md transition-all ${
                selectedRole?.name === 'ADMIN'
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border dark:border-slate-800'
                  : 'bg-primary text-white hover:opacity-90 cursor-pointer'
              }`}
            >
              Save Permission Layout
            </button>
          </div>

          {/* Settings / Inputs */}
          {selectedRole && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role Description</label>
                <input 
                  type="text" 
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              {!selectedRole.isSystemRole && (
                <div className="flex items-end justify-end pb-1">
                  <button 
                    onClick={() => handleDeleteRole(selectedRole.id)}
                    className="px-4 py-2 border border-rose-200/60 hover:bg-rose-50 text-rose-600 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                  >
                    Delete Custom Role
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Spreadsheet Grid */}
          <div className="overflow-x-auto border border-slate-200/50 dark:border-slate-800/80 rounded-xl">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-950/40 border-b border-slate-200/60 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase">
                  <th className="p-3 text-left">Module / Feature</th>
                  {actions.map(act => (
                    <th key={act.key} className="p-3 text-center w-24">{act.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {modules.map(mod => (
                  <tr key={mod.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10">
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{mod.label}</td>
                    {actions.map(act => {
                      const hasPerm = selectedRole?.name === 'ADMIN' || permissions.includes(`${mod.key}_${act.key}`);
                      return (
                        <td key={act.key} className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleCellClick(mod.key, act.key)}
                            disabled={selectedRole?.name === 'ADMIN'}
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                              selectedRole?.name === 'ADMIN'
                                ? 'cursor-not-allowed bg-slate-50 dark:bg-slate-950 text-slate-300'
                                : 'cursor-pointer hover:scale-105'
                            } ${
                              hasPerm 
                                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600' 
                                : 'bg-slate-100/70 dark:bg-slate-950 text-slate-300'
                            }`}
                          >
                            {hasPerm ? <Check size={14} className="stroke-[3]" /> : <X size={12} />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Create Custom Security Role</h2>
            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role Name</label>
                <input 
                  type="text" required
                  placeholder="e.g. WAREHOUSE_MANAGER"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                <input 
                  type="text" required
                  placeholder="e.g. Manages warehouse orders and inventory..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddRoleModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 cursor-pointer transition-all"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolePermissionMatrix;
