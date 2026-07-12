import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { useVehicleStore } from '../../store/vehicleStore';
import { useNotification } from '../../context/NotificationContext';

const VehicleFormModal = ({ isOpen, onClose, vehicle = null }) => {
  const { addVehicle, updateVehicle } = useVehicleStore();
  const { showSuccess, showError } = useNotification();
  const isEdit = !!vehicle;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      registrationNumber: '',
      name: '',
      type: 'Heavy Truck',
      maxCapacity: '',
      odometer: '',
      acquisitionCost: '',
      region: 'North'
    }
  });

  // Sync edit mode fields
  useEffect(() => {
    if (isOpen) {
      if (vehicle) {
        reset({
          registrationNumber: vehicle.registrationNumber,
          name: vehicle.name,
          type: vehicle.type,
          maxCapacity: vehicle.maxCapacity,
          odometer: vehicle.odometer,
          acquisitionCost: vehicle.acquisitionCost,
          region: vehicle.region
        });
      } else {
        reset({
          registrationNumber: '',
          name: '',
          type: 'Heavy Truck',
          maxCapacity: '',
          odometer: '',
          acquisitionCost: '',
          region: 'North'
        });
      }
    }
  }, [isOpen, vehicle, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        maxCapacity: Number(data.maxCapacity),
        odometer: Number(data.odometer),
        acquisitionCost: Number(data.acquisitionCost)
      };

      if (isEdit) {
        await updateVehicle(vehicle.id, payload);
        showSuccess('Vehicle updated successfully!');
      } else {
        await addVehicle(payload);
        showSuccess('Vehicle added to registry successfully!');
      }
      onClose();
    } catch (err) {
      showError(err.message || 'Operation failed.');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEdit ? `Edit Vehicle - ${vehicle.registrationNumber}` : 'Register New Fleet Vehicle'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Registration Number"
            placeholder="e.g. KA-01-ME-1234"
            error={errors.registrationNumber?.message}
            disabled={isEdit} // Prevent modifying plates once registered
            {...register('registrationNumber', { 
              required: 'Plate number is required.',
              pattern: {
                value: /^[A-Z]{2}-[0-9]{2}-[A-Z]{2,3}-[0-9]{4}$/i,
                message: 'Format must match: XX-00-XX-0000'
              }
            })}
          />

          <Input
            label="Model / Name"
            placeholder="e.g. Volvo FH16"
            error={errors.name?.message}
            {...register('name', { required: 'Model designation is required.' })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Vehicle Category"
            options={[
              { value: 'Heavy Truck', label: 'Heavy Truck' },
              { value: 'Semi-Trailer', label: 'Semi-Trailer' },
              { value: 'Light Van', label: 'Light Van' },
              { value: 'Box Truck', label: 'Box Truck' }
            ]}
            {...register('type')}
          />

          <Select
            label="Deployment Region"
            options={[
              { value: 'North', label: 'North Region' },
              { value: 'South', label: 'South Region' },
              { value: 'East', label: 'East Region' },
              { value: 'West', label: 'West Region' }
            ]}
            {...register('region')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Max Load (kg)"
            placeholder="e.g. 15000"
            type="number"
            error={errors.maxCapacity?.message}
            {...register('maxCapacity', { 
              required: 'Capacity is required.',
              min: { value: 1, message: 'Must be greater than 0.' }
            })}
          />

          <Input
            label="Current Odometer (km)"
            placeholder="e.g. 50000"
            type="number"
            error={errors.odometer?.message}
            {...register('odometer', { 
              required: 'Odometer is required.',
              min: { value: 0, message: 'Odometer cannot be negative.' }
            })}
          />

          <Input
            label="Acquisition Cost ($)"
            placeholder="e.g. 80000"
            type="number"
            error={errors.acquisitionCost?.message}
            {...register('acquisitionCost', { 
              required: 'Cost is required.',
              min: { value: 1, message: 'Must be greater than 0.' }
            })}
          />
        </div>

        <div className="flex items-center justify-end gap-3.5 border-t border-slate-200/40 dark:border-slate-800/40 pt-4.5 mt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Register Vehicle'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default VehicleFormModal;
