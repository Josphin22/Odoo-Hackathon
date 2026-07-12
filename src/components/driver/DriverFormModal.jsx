import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { useDriverStore } from '../../store/driverStore';
import { useNotification } from '../../context/NotificationContext';

const DriverFormModal = ({ isOpen, onClose, driver = null }) => {
  const { addDriver, updateDriver } = useDriverStore();
  const { showSuccess, showError } = useNotification();
  const isEdit = !!driver;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: '',
      licenseNumber: '',
      licenseCategory: 'Class A CDL',
      licenseExpiryDate: '',
      contactNumber: '',
      safetyScore: '90',
      status: 'Available'
    }
  });

  // Sync driver edit fields
  useEffect(() => {
    if (isOpen) {
      if (driver) {
        reset({
          name: driver.name,
          licenseNumber: driver.licenseNumber,
          licenseCategory: driver.licenseCategory,
          licenseExpiryDate: driver.licenseExpiryDate,
          contactNumber: driver.contactNumber,
          safetyScore: String(driver.safetyScore),
          status: driver.status
        });
      } else {
        reset({
          name: '',
          licenseNumber: '',
          licenseCategory: 'Class A CDL',
          licenseExpiryDate: '',
          contactNumber: '',
          safetyScore: '90',
          status: 'Available'
        });
      }
    }
  }, [isOpen, driver, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        safetyScore: Number(data.safetyScore)
      };

      if (isEdit) {
        await updateDriver(driver.id, payload);
        showSuccess('Driver profile updated successfully!');
      } else {
        await addDriver(payload);
        showSuccess('Driver registered successfully!');
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
      title={isEdit ? `Edit Driver - ${driver.name}` : 'Register New Fleet Operator'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Driver Full Name"
            placeholder="e.g. Robert Chen"
            error={errors.name?.message}
            {...register('name', { required: 'Driver name is required.' })}
          />

          <Input
            label="License Number"
            placeholder="e.g. DL-12345A"
            error={errors.licenseNumber?.message}
            {...register('licenseNumber', { required: 'License number is required.' })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="License Category"
            options={[
              { value: 'Class A CDL', label: 'Class A Commercial License' },
              { value: 'Class B CDL', label: 'Class B Commercial License' },
              { value: 'Class C CDL', label: 'Class C Commercial License' }
            ]}
            {...register('licenseCategory')}
          />

          <Input
            label="License Expiry Date"
            type="date"
            error={errors.licenseExpiryDate?.message}
            {...register('licenseExpiryDate', { required: 'Expiry date is required.' })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Contact Number"
            placeholder="e.g. +1-555-0123"
            error={errors.contactNumber?.message}
            {...register('contactNumber', { required: 'Contact number is required.' })}
          />

          <Input
            label="Safety Score (0-100)"
            placeholder="e.g. 90"
            type="number"
            error={errors.safetyScore?.message}
            {...register('safetyScore', { 
              required: 'Safety score is required.',
              min: { value: 0, message: 'Minimum score is 0.' },
              max: { value: 100, message: 'Maximum score is 100.' }
            })}
          />

          <Select
            label="Operator Status"
            options={[
              { value: 'Available', label: 'Available' },
              { value: 'On Trip', label: 'On Trip' },
              { value: 'Off Duty', label: 'Off Duty' },
              { value: 'Suspended', label: 'Suspended' }
            ]}
            {...register('status')}
          />
        </div>

        <div className="flex items-center justify-end gap-3.5 border-t border-slate-200/40 dark:border-slate-800/40 pt-4.5 mt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Register Operator'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DriverFormModal;
