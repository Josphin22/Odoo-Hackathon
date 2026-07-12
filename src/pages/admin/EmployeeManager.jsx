import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import { 
  Search, Plus, Edit2, Trash2, Key, CheckCircle, 
  XCircle, Filter, Download, ArrowRight, UserPlus, 
  Lock, Unlock, ChevronDown, CheckSquare, Square
} from 'lucide-react';

const EmployeeManager = () => {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Selected User for action
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Form States
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', phoneNumber: '', department: '',
    role: '', status: 'ACTIVE', dob: '', emergencyContact: '',
    bloodGroup: 'O+', nationality: 'Indian', aadhaarNumber: '', remarks: '',
    licenseNumber: '', licenseCategory: 'Class A CDL', licenseExpiryDate: '', safetyScore: 100
  });

  const [resetPasswordText, setResetPasswordText] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchEmployees();
    fetchRoles();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/users');
      setEmployees(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axiosInstance.get('/roles');
      setRoles(response.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/users?search=${searchTerm}`);
      setEmployees(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/users', formData);
      setShowAddModal(false);
      resetForm();
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create employee');
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/users/${selectedEmployee.id}`, formData);
      setShowEditModal(false);
      resetForm();
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update employee');
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to soft-delete this employee? All logs and history remain intact.')) return;
    try {
      await axiosInstance.delete(`/users/${id}`);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete employee');
    }
  };

  const handleUnlockEmployee = async (id) => {
    try {
      await axiosInstance.put(`/users/${id}/unlock`);
      fetchEmployees();
      alert('Account unlocked successfully.');
    } catch (err) {
      alert('Failed to unlock account');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/users/${selectedEmployee.id}/reset-password`, { password: resetPasswordText });
      setShowPasswordModal(false);
      setResetPasswordText('');
      alert('Password reset successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reset password');
    }
  };

  // Bulk Actions
  const handleBulkStatus = async (newStatus) => {
    if (selectedIds.length === 0) return;
    for (let id of selectedIds) {
      try {
        const emp = employees.find(e => e.id === id);
        if (emp) {
          const reqData = {
            fullName: emp.fullName, email: emp.email, role: emp.role, status: newStatus,
            phoneNumber: emp.phoneNumber, department: emp.department
          };
          await axiosInstance.put(`/users/${id}`, reqData);
        }
      } catch (err) {
        console.error(err);
      }
    }
    setSelectedIds([]);
    fetchEmployees();
    alert(`Bulk status updated to ${newStatus}`);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to soft-delete ${selectedIds.length} employees?`)) return;
    for (let id of selectedIds) {
      try {
        await axiosInstance.delete(`/users/${id}`);
      } catch (err) {
        console.error(err);
      }
    }
    setSelectedIds([]);
    fetchEmployees();
    alert('Bulk deletion completed.');
  };

  const handleBulkExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Employee ID,Name,Email,Phone,Department,Role,Status"].join(",") + "\n"
      + employees.map(e => [e.employeeId, e.fullName, e.email, e.phoneNumber, e.department, e.role, e.status].join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transitops_employees.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredEmployees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEmployees.map(e => e.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '', email: '', password: '', phoneNumber: '', department: '',
      role: '', status: 'ACTIVE', dob: '', emergencyContact: '',
      bloodGroup: 'O+', nationality: 'Indian', aadhaarNumber: '', remarks: '',
      licenseNumber: '', licenseCategory: 'Class A CDL', licenseExpiryDate: '', safetyScore: 100
    });
    setSelectedEmployee(null);
  };

  const openEditModal = (emp) => {
    setSelectedEmployee(emp);
    setFormData({
      fullName: emp.fullName || '',
      email: emp.email || '',
      phoneNumber: emp.phoneNumber || '',
      department: emp.department || '',
      role: emp.role || '',
      status: emp.status || 'ACTIVE',
      dob: emp.dob || '',
      emergencyContact: emp.emergencyContact || '',
      bloodGroup: emp.bloodGroup || 'O+',
      nationality: emp.nationality || 'Indian',
      aadhaarNumber: emp.aadhaarNumber || '',
      remarks: emp.remarks || '',
      licenseNumber: emp.licenseNumber || '',
      licenseCategory: emp.licenseCategory || 'Class A CDL',
      licenseExpiryDate: emp.licenseExpiryDate || '',
      safetyScore: emp.safetyScore || 100
    });
    setShowEditModal(true);
  };

  const filteredEmployees = employees.filter(e => {
    return (selectedRole === '' || e.role === selectedRole) &&
           (selectedStatus === '' || e.status === selectedStatus);
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-sans text-slate-800 dark:text-slate-100">Employee Directory</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Admin center for managing profiles, credentials, and company permissions.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 shadow-md cursor-pointer transition-all"
        >
          <UserPlus size={16} />
          Create Employee
        </button>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <div className="relative flex-1 min-w-[280px]">
            <input 
              type="text" 
              placeholder="Search by Employee ID, Name, Email or Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-primary"
            />
            <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
          </div>
          <button 
            onClick={handleSearch}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl transition-all cursor-pointer"
          >
            Search
          </button>
          
          {/* Filters */}
          <select 
            value={selectedRole} 
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-sm focus:outline-none"
          >
            <option value="">All Roles</option>
            {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
          </select>

          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-sm focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="ON_LEAVE">ON LEAVE</option>
            <option value="TERMINATED">TERMINATED</option>
          </select>
        </div>

        {/* Bulk Action Controls */}
        <div className="flex gap-2 items-center">
          {selectedIds.length > 0 && (
            <div className="flex gap-1 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-1 items-center">
              <span className="text-xs font-semibold px-2 text-slate-500">{selectedIds.length} selected</span>
              <button 
                onClick={() => handleBulkStatus('ACTIVE')}
                className="text-xs px-2 py-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 font-medium rounded-lg"
              >
                Activate
              </button>
              <button 
                onClick={() => handleBulkStatus('INACTIVE')}
                className="text-xs px-2 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 font-medium rounded-lg"
              >
                Deactivate
              </button>
              <button 
                onClick={handleBulkDelete}
                className="text-xs px-2 py-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-medium rounded-lg"
              >
                Delete
              </button>
            </div>
          )}
          <button 
            onClick={handleBulkExport}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs font-semibold cursor-pointer"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Grid Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-200/60 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase">
                <th className="p-4 w-12 text-center">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-primary">
                    {selectedIds.length === filteredEmployees.length && filteredEmployees.length > 0 ? (
                      <CheckSquare size={16} className="text-primary" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th className="p-4">Employee ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Role</th>
                <th className="p-4">Department</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/80 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-400">Loading employees list...</td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-400">No employees found.</td>
                </tr>
              ) : filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                  <td className="p-4 text-center">
                    <button onClick={() => toggleSelect(emp.id)} className="text-slate-400 hover:text-primary">
                      {selectedIds.includes(emp.id) ? (
                        <CheckSquare size={16} className="text-primary" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </td>
                  <td className="p-4 font-mono font-medium text-slate-800 dark:text-slate-200">{emp.employeeId}</td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{emp.fullName}</div>
                    {emp.isLocked && (
                      <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        <Lock size={10} /> Locked
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{emp.email}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{emp.phoneNumber || '-'}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
                      {emp.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{emp.department || '-'}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-bold rounded-full ${
                      emp.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' :
                      emp.status === 'SUSPENDED' ? 'bg-amber-50 text-amber-700' :
                      emp.status === 'ON_LEAVE' ? 'bg-blue-50 text-blue-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1.5">
                    {emp.isLocked && (
                      <button 
                        onClick={() => handleUnlockEmployee(emp.id)}
                        className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 border border-amber-200/50 cursor-pointer"
                        title="Unlock Account"
                      >
                        <Unlock size={14} />
                      </button>
                    )}
                    <button 
                      onClick={() => { setSelectedEmployee(emp); setShowPasswordModal(true); }}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 border border-slate-200/50 cursor-pointer"
                      title="Reset Password"
                    >
                      <Key size={14} />
                    </button>
                    <button 
                      onClick={() => openEditModal(emp)}
                      className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 border border-indigo-200/50 cursor-pointer"
                      title="Edit Employee"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteEmployee(emp.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 border border-rose-200/50 cursor-pointer"
                      title="Soft Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold font-sans text-slate-800 dark:text-slate-100">Create Employee Account</h2>
            <form onSubmit={handleCreateEmployee} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input 
                  type="text" required
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email (Username)</label>
                <input 
                  type="email" required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Temporary Password</label>
                <input 
                  type="password" required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Min 8 chars, mixed case + special char"
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                <input 
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                <select 
                  value={formData.role} required
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm"
                >
                  <option value="">Select Role</option>
                  {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department</label>
                <input 
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date of Birth</label>
                <input 
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Emergency Contact</label>
                <input 
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Blood Group</label>
                <select 
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm"
                >
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="ON_LEAVE">ON LEAVE</option>
                </select>
              </div>

              {/* Conditional Driver Profile fields */}
              {formData.role.toUpperCase() === 'DRIVER' && (
                <div className="col-span-1 md:col-span-2 border-t border-slate-200 dark:border-slate-800 pt-3 mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1 md:col-span-2">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Driver License Credentials</h3>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">License Number</label>
                    <input 
                      type="text" required
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">License Category</label>
                    <input 
                      type="text"
                      value={formData.licenseCategory}
                      onChange={(e) => setFormData({...formData, licenseCategory: e.target.value})}
                      placeholder="e.g. Class A CDL"
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">License Expiry Date</label>
                    <input 
                      type="date" required
                      value={formData.licenseExpiryDate}
                      onChange={(e) => setFormData({...formData, licenseExpiryDate: e.target.value})}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Initial Safety Score</label>
                    <input 
                      type="number" max="100" min="0"
                      value={formData.safetyScore}
                      onChange={(e) => setFormData({...formData, safetyScore: parseInt(e.target.value)})}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="col-span-1 md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 cursor-pointer transition-all"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold font-sans text-slate-800 dark:text-slate-100">Edit Employee Profile</h2>
            <form onSubmit={handleUpdateEmployee} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input 
                  type="text" required
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                <input 
                  type="email" required disabled
                  value={formData.email}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-100 dark:bg-slate-950 text-slate-500 text-sm cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                <input 
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                <select 
                  value={formData.role} required
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm"
                >
                  <option value="">Select Role</option>
                  {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department</label>
                <input 
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="ON_LEAVE">ON LEAVE</option>
                  <option value="TERMINATED">TERMINATED</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date of Birth</label>
                <input 
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Emergency Contact</label>
                <input 
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Blood Group</label>
                <select 
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm"
                >
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nationality</label>
                <input 
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm"
                />
              </div>

              {formData.role.toUpperCase() === 'DRIVER' && (
                <div className="col-span-1 md:col-span-2 border-t border-slate-200 dark:border-slate-800 pt-3 mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1 md:col-span-2">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Driver License Credentials</h3>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">License Number</label>
                    <input 
                      type="text" required
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">License Category</label>
                    <input 
                      type="text"
                      value={formData.licenseCategory}
                      onChange={(e) => setFormData({...formData, licenseCategory: e.target.value})}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">License Expiry Date</label>
                    <input 
                      type="date" required
                      value={formData.licenseExpiryDate}
                      onChange={(e) => setFormData({...formData, licenseExpiryDate: e.target.value})}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Safety Score</label>
                    <input 
                      type="number" max="100" min="0"
                      value={formData.safetyScore}
                      onChange={(e) => setFormData({...formData, safetyScore: parseInt(e.target.value)})}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="col-span-1 md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 cursor-pointer transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Force Password Reset</h2>
              <p className="text-xs text-slate-500">Employee: <span className="font-semibold">{selectedEmployee?.fullName}</span></p>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Temporary Password</label>
                <input 
                  type="password" required
                  placeholder="Min 8 chars, mixed case + special char"
                  value={resetPasswordText}
                  onChange={(e) => setResetPasswordText(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 cursor-pointer transition-all"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManager;
