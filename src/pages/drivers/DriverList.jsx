import React, { useEffect, useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import DriverFormModal from '../../components/driver/DriverFormModal';
import { useDriverStore } from '../../store/driverStore';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Plus, Edit2, Trash2, ShieldAlert, Eye } from 'lucide-react';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';

const DriverList = () => {
  const { drivers, loading, fetchDrivers, deleteDriver } = useDriverStore();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [driverToView, setDriverToView] = useState(null);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [safetyFilter, setSafetyFilter] = useState('');

  const canEdit = ['FLEET_MANAGER', 'SAFETY_OFFICER'].includes(user?.role);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  // Expiry check logic (Current date: 2026-07-12)
  const isLicenseExpired = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const now = new Date('2026-07-12');
    return expiry < now;
  };

  // Visual filter logic
  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => {
      const matchSearch = searchQuery ? (
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase())
      ) : true;

      const matchStatus = statusFilter ? d.status === statusFilter : true;
      
      let matchSafety = true;
      if (safetyFilter === 'excellent') matchSafety = d.safetyScore >= 90;
      else if (safetyFilter === 'good') matchSafety = d.safetyScore >= 80 && d.safetyScore < 90;
      else if (safetyFilter === 'poor') matchSafety = d.safetyScore < 80;

      return matchSearch && matchStatus && matchSafety;
    });
  }, [drivers, searchQuery, statusFilter, safetyFilter]);

  const handleEdit = (driver) => {
    setSelectedDriver(driver);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedDriver(null);
    setIsFormOpen(true);
  };

  const handleDeleteTrigger = (driver) => {
    setDriverToDelete(driver);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteDriver(driverToDelete.id);
      showSuccess(`Driver profile '${driverToDelete.name}' deleted successfully.`);
      setIsDeleteOpen(false);
    } catch (err) {
      showError(err.message || 'Deletion failed.');
    }
  };

  const handleViewDetails = (driver) => {
    setDriverToView(driver);
    setIsDetailOpen(true);
  };

  const columns = [
    { 
      key: 'name', 
      label: 'Driver Name', 
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 dark:text-slate-200">{val}</span>
          {isLicenseExpired(row.licenseExpiryDate) && (
            <span className="text-rose-500" title="License Expired!">
              <ShieldAlert size={14} className="animate-subtle-pulse" />
            </span>
          )}
        </div>
      )
    },
    { key: 'licenseNumber', label: 'License Code', sortable: true, className: 'font-mono text-xs' },
    { key: 'licenseCategory', label: 'Category', sortable: true },
    { 
      key: 'licenseExpiryDate', 
      label: 'License Expiry', 
      sortable: true,
      render: (val) => {
        const expired = isLicenseExpired(val);
        return (
          <span className={`font-semibold ${expired ? 'text-rose-500 font-bold' : ''}`}>
            {val} {expired ? '(EXPIRED)' : ''}
          </span>
        );
      }
    },
    { key: 'contactNumber', label: 'Contact', sortable: false },
    { 
      key: 'safetyScore', 
      label: 'Safety Rating', 
      sortable: true, 
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${val >= 90 ? 'bg-emerald-500' : val >= 80 ? 'bg-amber-500' : 'bg-rose-500'}`} 
              style={{ width: `${val}%` }}
            />
          </div>
          <span className="text-xs font-bold">{val}</span>
        </div>
      )
    },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true, 
      render: (val) => <Badge>{val}</Badge> 
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      className: 'text-right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleViewDetails(row)}
            className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
            title="View Details"
          >
            <Eye size={15} />
          </button>
          {canEdit && (
            <>
              <button
                onClick={() => handleEdit(row)}
                className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
                title="Edit Profile"
              >
                <Edit2 size={15} />
              </button>
              <button
                onClick={() => handleDeleteTrigger(row)}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
                title="Delete Driver"
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <PageWrapper>
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/40 dark:border-slate-800/50 pb-5">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 font-sans">
            Driver Directory
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-sans mt-0.5">
            Monitor commercial driver listings, safety score performance, and compliance schedules
          </p>
        </div>
        {canEdit && (
          <Button variant="primary" size="sm" icon={Plus} onClick={handleCreate}>
            Register Operator
          </Button>
        )}
      </div>

      {/* Live Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 bg-white/30 dark:bg-slate-900/10 border border-slate-200/40 dark:border-slate-800/80 p-4.5 rounded-2xl backdrop-blur-md shadow-premium">
        <div className="lg:col-span-2">
          <Input
            placeholder="Search driver name or license..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white dark:bg-slate-800"
          />
        </div>
        <Select
          placeholder="All Statuses"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'Available', label: 'Available' },
            { value: 'On Trip', label: 'On Trip' },
            { value: 'Off Duty', label: 'Off Duty' },
            { value: 'Suspended', label: 'Suspended' }
          ]}
          className="bg-white dark:bg-slate-800"
        />
        <Select
          placeholder="All Safety Ratings"
          value={safetyFilter}
          onChange={(e) => setSafetyFilter(e.target.value)}
          options={[
            { value: 'excellent', label: 'Excellent (90+)' },
            { value: 'good', label: 'Good (80-89)' },
            { value: 'poor', label: 'Poor (<80)' }
          ]}
          className="bg-white dark:bg-slate-800"
        />
      </div>

      {/* Grid Table */}
      <Table
        columns={columns}
        data={filteredDrivers}
        loading={loading}
        pageSize={5}
      />

      {/* Driver profile Form Modal */}
      <DriverFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        driver={selectedDriver}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Deregister Driver?"
        message={driverToDelete ? `Are you sure you want to delete driver profile '${driverToDelete.name}' from TransitOps directory?` : ''}
      />

      {/* Detail overlay modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={driverToView ? `Driver Profile Details` : ''}
        size="md"
      >
        {driverToView && (
          <div className="flex flex-col gap-5 text-sm font-sans">
            <div className="flex items-center gap-4 border-b border-slate-200/40 dark:border-slate-800/40 pb-4">
              <div className="w-12 h-12 bg-primary-light/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-base rounded-2xl select-none">
                {driverToView.name.split(' ').map(n=>n[0]).join('')}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800 dark:text-slate-100 text-base">{driverToView.name}</span>
                <span className="text-xs text-slate-400">Driver License Category: {driverToView.licenseCategory}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4.5">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">License Number</span>
                <span className="font-mono">{driverToView.licenseNumber}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">License Expiration</span>
                <span className={`font-semibold ${isLicenseExpired(driverToView.licenseExpiryDate) ? 'text-rose-500' : ''}`}>
                  {driverToView.licenseExpiryDate}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Number</span>
                <span>{driverToView.contactNumber}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Safety Rating</span>
                <span className="font-semibold">{driverToView.safetyScore} / 100</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operational Status</span>
                <div><Badge>{driverToView.status}</Badge></div>
              </div>
            </div>

            <div className="border-t border-slate-200/40 dark:border-slate-800/40 pt-4 mt-2 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setIsDetailOpen(false)}>
                Close Panel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
};

export default DriverList;
