import React, { useEffect, useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import DispatchFormModal from '../../components/trip/DispatchFormModal';
import { useTripStore } from '../../store/tripStore';
import { useVehicleStore } from '../../store/vehicleStore';
import { useDriverStore } from '../../store/driverStore';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Plus, Play, CheckCircle, XCircle, SlidersHorizontal, MapPin } from 'lucide-react';
import Select from '../../components/common/Select';
import { useForm } from 'react-hook-form';

const TripList = () => {
  const { trips, loading, fetchTrips, dispatchTrip, completeTrip, cancelTrip } = useTripStore();
  const { vehicles, fetchVehicles } = useVehicleStore();
  const { drivers, fetchDrivers } = useDriverStore();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [tripToComplete, setTripToComplete] = useState(null);

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const isManager = user?.role === 'FLEET_MANAGER';
  const isDriver = user?.role === 'DRIVER';
  const canDispatch = isManager;
  const canComplete = isManager || isDriver;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      finalOdometer: '',
      fuelConsumed: ''
    }
  });

  useEffect(() => {
    fetchTrips();
    fetchVehicles();
    fetchDrivers();
  }, [fetchTrips, fetchVehicles, fetchDrivers]);

  // Map ID to entity name
  const vehicleMap = useMemo(() => new Map(vehicles.map(v => [v.id, v])), [vehicles]);
  const driverMap = useMemo(() => new Map(drivers.map(d => [d.id, d])), [drivers]);

  // Apply filtering
  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      const v = vehicleMap.get(t.vehicleId);
      const d = driverMap.get(t.driverId);

      const matchSearch = searchQuery ? (
        t.tripNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      ) : true;

      const matchStatus = statusFilter ? t.status === statusFilter : true;

      return matchSearch && matchStatus;
    });
  }, [trips, searchQuery, statusFilter, vehicleMap, driverMap]);

  const handleDispatch = async (id) => {
    try {
      await dispatchTrip(id);
      showSuccess('Trip dispatched! Vehicle and driver are now active.');
    } catch (err) {
      showError(err.message || 'Dispatch failed.');
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelTrip(id);
      showSuccess('Trip has been cancelled. Deployments released.');
    } catch (err) {
      showError(err.message || 'Cancellation failed.');
    }
  };

  const handleCompleteTrigger = (trip) => {
    setTripToComplete(trip);
    const vehicle = vehicleMap.get(trip.vehicleId);
    
    reset({
      finalOdometer: vehicle ? String(vehicle.odometer + trip.plannedDistance) : '',
      fuelConsumed: '120' // Pre-fill default estimate
    });
    
    setIsCompleteOpen(true);
  };

  const handleCompleteConfirm = async (data) => {
    try {
      await completeTrip(
        tripToComplete.id, 
        Number(data.finalOdometer), 
        Number(data.fuelConsumed)
      );
      showSuccess('Trip completed successfully. Logs and expenses registered!');
      setIsCompleteOpen(false);
    } catch (err) {
      showError(err.message || 'Operation failed.');
    }
  };

  const columns = [
    { key: 'tripNumber', label: 'Trip ID', sortable: true, className: 'font-mono font-semibold text-xs text-primary' },
    { 
      key: 'routing', 
      label: 'Source & Destination', 
      sortable: false,
      render: (_, row) => (
        <div className="flex flex-col gap-0.5 font-sans">
          <span className="font-semibold text-slate-800 dark:text-slate-200">{row.source}</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">to {row.destination}</span>
        </div>
      )
    },
    { 
      key: 'vehicleId', 
      label: 'Vehicle Assigned', 
      sortable: true, 
      render: (val) => vehicleMap.get(val)?.name || 'Loading...' 
    },
    { 
      key: 'driverId', 
      label: 'Driver Assigned', 
      sortable: true, 
      render: (val) => driverMap.get(val)?.name || 'Loading...' 
    },
    { key: 'cargoWeight', label: 'Cargo Load', sortable: true, render: (val) => `${val.toLocaleString()} kg` },
    { key: 'plannedDistance', label: 'Distance', sortable: true, render: (val) => `${val.toLocaleString()} km` },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true, 
      render: (val) => <Badge>{val}</Badge> 
    },
    {
      key: 'actions',
      label: 'Status Transition Controls',
      sortable: false,
      className: 'text-right',
      render: (_, row) => {
        if (row.status === 'Draft' && canDispatch) {
          return (
            <div className="flex items-center justify-end gap-2">
              <Button 
                variant="primary" 
                size="sm" 
                icon={Play}
                onClick={() => handleDispatch(row.id)}
              >
                Dispatch
              </Button>
              <Button 
                variant="ghost" 
                className="text-rose-500 hover:bg-rose-500/5 hover:text-rose-600" 
                size="sm" 
                icon={XCircle}
                onClick={() => handleCancel(row.id)}
              >
                Cancel
              </Button>
            </div>
          );
        }

        if (row.status === 'Dispatched') {
          return (
            <div className="flex items-center justify-end gap-2">
              {canComplete && (
                <Button 
                  variant="accent" 
                  size="sm" 
                  icon={CheckCircle}
                  onClick={() => handleCompleteTrigger(row)}
                >
                  Complete
                </Button>
              )}
              {isManager && (
                <Button 
                  variant="ghost" 
                  className="text-rose-500 hover:bg-rose-500/5 hover:text-rose-600" 
                  size="sm" 
                  icon={XCircle}
                  onClick={() => handleCancel(row.id)}
                >
                  Cancel
                </Button>
              )}
            </div>
          );
        }

        return <span className="text-xs text-slate-400 font-sans font-medium">None</span>;
      }
    }
  ];

  const activeVehicle = tripToComplete ? vehicleMap.get(tripToComplete.vehicleId) : null;

  return (
    <PageWrapper>
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/40 dark:border-slate-800/50 pb-5">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 font-sans">
            Transport Route Operations
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-sans mt-0.5">
            Create routing missions, validate vehicle cargo weights, and track trip status transitions
          </p>
        </div>
        {isManager && (
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsPlanOpen(true)}>
            Schedule Trip
          </Button>
        )}
      </div>

      {/* Filter Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 bg-white/30 dark:bg-slate-900/10 border border-slate-200/40 dark:border-slate-800/80 p-4.5 rounded-2xl backdrop-blur-md shadow-premium">
        <div className="lg:col-span-3">
          <Input
            placeholder="Search trip ID, source, driver, or vehicle..."
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
            { value: 'Draft', label: 'Draft / Planned' },
            { value: 'Dispatched', label: 'Dispatched / On Trip' },
            { value: 'Completed', label: 'Completed' },
            { value: 'Cancelled', label: 'Cancelled' }
          ]}
          className="bg-white dark:bg-slate-800"
        />
      </div>

      {/* Main Table Grid */}
      <Table
        columns={columns}
        data={filteredTrips}
        loading={loading}
        pageSize={5}
      />

      {/* Dispatch Planning modal */}
      <DispatchFormModal
        isOpen={isPlanOpen}
        onClose={() => setIsPlanOpen(false)}
      />

      {/* Complete Trip Input Modal */}
      <Modal
        isOpen={isCompleteOpen}
        onClose={() => setIsCompleteOpen(false)}
        title="Complete Transport Mission"
        size="sm"
      >
        {tripToComplete && (
          <form onSubmit={handleSubmit(handleCompleteConfirm)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 border-b border-slate-200/40 dark:border-slate-800/40 pb-4">
              <span className="text-xs font-semibold text-slate-400 font-sans">TRIP DESIGNATION</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                {tripToComplete.tripNumber}: {tripToComplete.source} to {tripToComplete.destination}
              </span>
              {activeVehicle && (
                <span className="text-[10px] text-slate-400 mt-1 font-sans">
                  Vehicle Odometer starts at: <span className="font-bold text-slate-500">{activeVehicle.odometer.toLocaleString()} km</span>. Planned distance is: <span className="font-semibold text-slate-500">{tripToComplete.plannedDistance} km</span>.
                </span>
              )}
            </div>

            <Input
              label="Final Odometer Reading (km)"
              placeholder="e.g. 125850"
              type="number"
              error={errors.finalOdometer?.message}
              {...register('finalOdometer', {
                required: 'Final odometer value is required.',
                validate: (val) => {
                  if (activeVehicle && Number(val) <= activeVehicle.odometer) {
                    return `Must exceed starting odometer reading (${activeVehicle.odometer.toLocaleString()} km).`;
                  }
                  return true;
                }
              })}
            />

            <Input
              label="Actual Fuel Consumed (Liters)"
              placeholder="e.g. 180"
              type="number"
              error={errors.fuelConsumed?.message}
              {...register('fuelConsumed', {
                required: 'Fuel logged is required.',
                min: { value: 0, message: 'Fuel consumed cannot be negative.' }
              })}
            />

            <div className="flex items-center justify-end gap-3 border-t border-slate-200/40 dark:border-slate-800/40 pt-4 mt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsCompleteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save & Complete
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </PageWrapper>
  );
};

export default TripList;
