import React, { useEffect, useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import VehicleFormModal from '../../components/vehicle/VehicleFormModal';
import { useVehicleStore } from '../../store/vehicleStore';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Plus, Edit2, Trash2, SlidersHorizontal, Eye } from 'lucide-react';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';

const VehicleList = () => {
  const { vehicles, loading, fetchVehicles, deleteVehicle } = useVehicleStore();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [vehicleToView, setVehicleToView] = useState(null);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const isManager = user?.role === 'FLEET_MANAGER';

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Apply visual filtering
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchSearch = searchQuery ? (
        v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) : true;

      const matchRegion = regionFilter ? v.region === regionFilter : true;
      const matchType = typeFilter ? v.type === typeFilter : true;
      const matchStatus = statusFilter ? v.status === statusFilter : true;

      return matchSearch && matchRegion && matchType && matchStatus;
    });
  }, [vehicles, searchQuery, regionFilter, typeFilter, statusFilter]);

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedVehicle(null);
    setIsFormOpen(true);
  };

  const handleDeleteTrigger = (vehicle) => {
    setVehicleToDelete(vehicle);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteVehicle(vehicleToDelete.id);
      showSuccess(`Vehicle '${vehicleToDelete.registrationNumber}' deleted successfully.`);
      setIsDeleteOpen(false);
    } catch (err) {
      showError(err.message || 'Deletion failed.');
    }
  };

  const handleViewDetails = (vehicle) => {
    setVehicleToView(vehicle);
    setIsDetailOpen(true);
  };

  const columns = [
    { key: 'registrationNumber', label: 'Plate Number', sortable: true, className: 'font-semibold font-mono text-xs tracking-wider' },
    { key: 'name', label: 'Model Name', sortable: true },
    { key: 'type', label: 'Category', sortable: true },
    { key: 'maxCapacity', label: 'Max Load', sortable: true, render: (val) => `${val.toLocaleString()} kg` },
    { key: 'odometer', label: 'Odometer', sortable: true, render: (val) => `${val.toLocaleString()} km` },
    { key: 'region', label: 'Region', sortable: true },
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
          {isManager && (
            <>
              <button
                onClick={() => handleEdit(row)}
                className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
                title="Edit Vehicle"
              >
                <Edit2 size={15} />
              </button>
              <button
                onClick={() => handleDeleteTrigger(row)}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
                title="Delete Vehicle"
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
      {/* Top Header Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/40 dark:border-slate-800/50 pb-5">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 font-sans">
            Fleet Asset Registry
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-sans mt-0.5">
            Manage logistics hardware, status indicators, capacities, and region boundaries
          </p>
        </div>
        {isManager && (
          <Button variant="primary" size="sm" icon={Plus} onClick={handleCreate}>
            Register Vehicle
          </Button>
        )}
      </div>

      {/* Local Filter controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 bg-white/30 dark:bg-slate-900/10 border border-slate-200/40 dark:border-slate-800/80 p-4.5 rounded-2xl backdrop-blur-md shadow-premium">
        <div className="lg:col-span-2">
          <Input
            placeholder="Search plate or model name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white dark:bg-slate-800"
          />
        </div>
        <Select
          placeholder="All Regions"
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          options={[
            { value: 'North', label: 'North' },
            { value: 'South', label: 'South' },
            { value: 'East', label: 'East' },
            { value: 'West', label: 'West' }
          ]}
          className="bg-white dark:bg-slate-800"
        />
        <Select
          placeholder="All Types"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={[
            { value: 'Heavy Truck', label: 'Heavy Truck' },
            { value: 'Semi-Trailer', label: 'Semi-Trailer' },
            { value: 'Light Van', label: 'Light Van' },
            { value: 'Box Truck', label: 'Box Truck' }
          ]}
          className="bg-white dark:bg-slate-800"
        />
        <Select
          placeholder="All Statuses"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'Available', label: 'Available' },
            { value: 'On Trip', label: 'On Trip' },
            { value: 'In Shop', label: 'In Shop' },
            { value: 'Retired', label: 'Retired' }
          ]}
          className="bg-white dark:bg-slate-800"
        />
      </div>

      {/* Table Data Grid */}
      <Table
        columns={columns}
        data={filteredVehicles}
        loading={loading}
        pageSize={5}
      />

      {/* Vehicle Creation / Modification Form Modal */}
      <VehicleFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        vehicle={selectedVehicle}
      />

      {/* Delete Confirmation Alert */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Deregister Vehicle?"
        message={vehicleToDelete ? `Are you sure you want to permanently delete vehicle '${vehicleToDelete.name} (${vehicleToDelete.registrationNumber})' from registry?` : ''}
      />

      {/* Detail Overlay Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={vehicleToView ? `Vehicle Detail Card - ${vehicleToView.registrationNumber}` : ''}
        size="md"
      >
        {vehicleToView && (
          <div className="flex flex-col gap-5 text-sm font-sans">
            <div className="grid grid-cols-2 gap-4.5">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Model Model</span>
                <span className="text-slate-800 dark:text-slate-100 font-semibold">{vehicleToView.name}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plate Registration</span>
                <span className="text-slate-800 dark:text-slate-100 font-mono font-semibold">{vehicleToView.registrationNumber}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hardware Category</span>
                <span>{vehicleToView.type}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Region Zone</span>
                <span>{vehicleToView.region} Region</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Maximum Payload</span>
                <span>{vehicleToView.maxCapacity.toLocaleString()} kg</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Distance Logged</span>
                <span>{vehicleToView.odometer.toLocaleString()} km</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Acquisition Cost</span>
                <span>${vehicleToView.acquisitionCost.toLocaleString()}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deployment Status</span>
                <div><Badge>{vehicleToView.status}</Badge></div>
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

export default VehicleList;
