import React, { useEffect, useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useForm } from 'react-hook-form';
import { fuelApi } from '../../api/fuelApi';
import { useVehicleStore } from '../../store/vehicleStore';
import { useNotification } from '../../context/NotificationContext';
import { Plus } from 'lucide-react';

const FuelLogs = () => {
  const { vehicles, fetchVehicles } = useVehicleStore();
  const { showSuccess, showError } = useNotification();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      vehicleId: '',
      liters: '',
      cost: '',
      date: new Date().toISOString().split('T')[0]
    }
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fuelApi.getAll();
      setLogs(res.data);
    } catch (err) {
      showError('Failed to fetch fuel records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchVehicles();
  }, [fetchVehicles]);

  const vehicleMap = useMemo(() => new Map(vehicles.map(v => [v.id, v])), [vehicles]);

  const vehicleOptions = useMemo(() => {
    return vehicles
      .filter(v => v.status !== 'Retired')
      .map(v => ({
        value: v.id,
        label: `${v.name} (${v.registrationNumber})`
      }));
  }, [vehicles]);

  const onSubmit = async (data) => {
    try {
      await fuelApi.create({
        ...data,
        liters: Number(data.liters),
        cost: Number(data.cost)
      });
      showSuccess('Fuel refuel event logged successfully!');
      setIsAddOpen(false);
      reset();
      fetchLogs();
    } catch (err) {
      showError('Failed to log fuel entry.');
    }
  };

  const columns = [
    {
      key: 'vehicleId',
      label: 'Vehicle Plate',
      sortable: true,
      render: (val) => {
        const v = vehicleMap.get(val);
        return v ? `${v.registrationNumber} (${v.name})` : 'Loading...';
      }
    },
    { key: 'liters', label: 'Fuel Added (L)', sortable: true, render: (val) => `${val.toLocaleString()} Liters` },
    { key: 'cost', label: 'Refuel Cost', sortable: true, render: (val) => `$${val.toLocaleString()}` },
    { key: 'date', label: 'Refuel Date', sortable: true }
  ];

  return (
    <PageWrapper>
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/40 dark:border-slate-800/50 pb-5">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 font-sans">
            Fuel Log Ledger
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-sans mt-0.5">
            Log gas station receipts, monitor vehicle fill-up quantities, and track operations expenses
          </p>
        </div>
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsAddOpen(true)}>
          Log Refuel
        </Button>
      </div>

      {/* Grid Table */}
      <Table
        columns={columns}
        data={logs}
        loading={loading}
        pageSize={5}
      />

      {/* Log Refuel Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Log Fuel Refill"
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Select
            label="Assigned Vehicle"
            placeholder="Select Vehicle..."
            options={vehicleOptions}
            error={errors.vehicleId?.message}
            {...register('vehicleId', { required: 'Vehicle assignment is required.' })}
          />

          <Input
            label="Liters Refilled"
            placeholder="e.g. 150"
            type="number"
            error={errors.liters?.message}
            {...register('liters', {
              required: 'Liters value is required.',
              min: { value: 1, message: 'Must be greater than 0.' }
            })}
          />

          <Input
            label="Receipt Cost ($)"
            placeholder="e.g. 300"
            type="number"
            error={errors.cost?.message}
            {...register('cost', {
              required: 'Total cost is required.',
              min: { value: 1, message: 'Must be greater than 0.' }
            })}
          />

          <Input
            label="Refuel Date"
            type="date"
            error={errors.date?.message}
            {...register('date', { required: 'Date is required.' })}
          />

          <div className="flex items-center justify-end gap-3 border-t border-slate-200/40 dark:border-slate-800/40 pt-4 mt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Entry
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
};

export default FuelLogs;
