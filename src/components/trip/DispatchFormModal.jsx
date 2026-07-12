import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { useTripStore } from '../../store/tripStore';
import { useVehicleStore } from '../../store/vehicleStore';
import { useDriverStore } from '../../store/driverStore';
import { useNotification } from '../../context/NotificationContext';
import { Route } from 'lucide-react';

const DispatchFormModal = ({ isOpen, onClose }) => {
  const { createTrip } = useTripStore();
  const { vehicles, fetchVehicles } = useVehicleStore();
  const { drivers, fetchDrivers } = useDriverStore();
  const { showSuccess, showError } = useNotification();

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      source: '',
      destination: '',
      vehicleId: '',
      driverId: '',
      cargoWeight: '',
      plannedDistance: ''
    }
  });

  const selectedVehicleId = watch('vehicleId');

  // Load lists on open
  useEffect(() => {
    if (isOpen) {
      fetchVehicles();
      fetchDrivers();
      reset({
        source: '',
        destination: '',
        vehicleId: '',
        driverId: '',
        cargoWeight: '',
        plannedDistance: ''
      });
    }
  }, [isOpen, fetchVehicles, fetchDrivers, reset]);

  // Expiry date verification logic (relative to current date 2026-07-12)
  const isLicenseExpired = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const now = new Date('2026-07-12');
    return expiry < now;
  };

  // Filter out ineligible vehicles for dropdown (no In Shop, Retired, or On Trip)
  const eligibleVehicles = useMemo(() => {
    return vehicles
      .filter(v => v.status === 'Available')
      .map(v => ({
        value: v.id,
        label: `${v.name} (${v.registrationNumber}) - Cap: ${v.maxCapacity.toLocaleString()}kg`
      }));
  }, [vehicles]);

  // Filter out ineligible drivers for dropdown (no Suspended, On Trip, or Expired)
  const eligibleDrivers = useMemo(() => {
    return drivers
      .filter(d => d.status === 'Available' && !isLicenseExpired(d.licenseExpiryDate))
      .map(d => ({
        value: d.id,
        label: `${d.name} (${d.licenseCategory}) - Score: ${d.safetyScore}`
      }));
  }, [drivers]);

  // Get active stats of selected vehicle to show limits on screen
  const selectedVehicleObj = useMemo(() => {
    return vehicles.find(v => v.id === selectedVehicleId);
  }, [selectedVehicleId, vehicles]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        cargoWeight: Number(data.cargoWeight),
        plannedDistance: Number(data.plannedDistance)
      };

      const newT = await createTrip(payload);
      showSuccess(`Trip ${newT.tripNumber} planned as Draft successfully!`);
      onClose();
    } catch (err) {
      showError(err.message || 'Failed to schedule trip.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Plan New Transport Route"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Source Location"
            placeholder="e.g. Chicago Hub"
            error={errors.source?.message}
            {...register('source', { required: 'Source location is required.' })}
          />

          <Input
            label="Destination Location"
            placeholder="e.g. Detroit Depot"
            error={errors.destination?.message}
            {...register('destination', { required: 'Destination location is required.' })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Select Cargo Vehicle"
            placeholder="Choose Available Vehicle..."
            options={eligibleVehicles}
            error={errors.vehicleId?.message}
            {...register('vehicleId', { required: 'Vehicle assignment is required.' })}
          />

          <Select
            label="Select Operator (Driver)"
            placeholder="Choose Available Operator..."
            options={eligibleDrivers}
            error={errors.driverId?.message}
            {...register('driverId', { required: 'Driver assignment is required.' })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Cargo Weight (kg)"
            placeholder="e.g. 10000"
            type="number"
            error={errors.cargoWeight?.message}
            {...register('cargoWeight', { 
              required: 'Cargo weight is required.',
              min: { value: 1, message: 'Must be greater than 0.' },
              validate: (val) => {
                if (selectedVehicleObj && Number(val) > selectedVehicleObj.maxCapacity) {
                  return `Weight exceeds vehicle load capacity limit (${selectedVehicleObj.maxCapacity.toLocaleString()} kg).`;
                }
                return true;
              }
            })}
          />

          <Input
            label="Planned Routing Distance (km)"
            placeholder="e.g. 450"
            type="number"
            error={errors.plannedDistance?.message}
            {...register('plannedDistance', { 
              required: 'Distance is required.',
              min: { value: 1, message: 'Must be greater than 0.' }
            })}
          />
        </div>

        {selectedVehicleObj && (
          <div className="p-3 bg-indigo-500/5 dark:bg-indigo-950/10 border border-indigo-200/40 dark:border-indigo-900/30 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 font-sans flex items-start gap-2">
            <Route size={14} className="text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-200">Vehicle Limit Info:</span> Max payload capacity of <span className="font-semibold">{selectedVehicleObj.name}</span> is <span className="font-bold">{selectedVehicleObj.maxCapacity.toLocaleString()} kg</span>. Odometer is currently at <span className="font-semibold">{selectedVehicleObj.odometer.toLocaleString()} km</span>.
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3.5 border-t border-slate-200/40 dark:border-slate-800/40 pt-4.5 mt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
            Create Draft Trip
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DispatchFormModal;
