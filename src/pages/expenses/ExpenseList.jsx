import React, { useEffect, useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useForm } from 'react-hook-form';
import { expenseApi } from '../../api/expenseApi';
import { useVehicleStore } from '../../store/vehicleStore';
import { useNotification } from '../../context/NotificationContext';
import { Plus } from 'lucide-react';
import Badge from '../../components/common/Badge';

const ExpenseList = () => {
  const { vehicles, fetchVehicles } = useVehicleStore();
  const { showSuccess, showError } = useNotification();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      vehicleId: '',
      type: 'Tolls',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    }
  });

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await expenseApi.getAll();
      setExpenses(res.data);
    } catch (err) {
      showError('Failed to fetch expense records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
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
      await expenseApi.create({
        ...data,
        amount: Number(data.amount)
      });
      showSuccess('General expense logged successfully!');
      setIsAddOpen(false);
      reset();
      fetchExpenses();
    } catch (err) {
      showError('Failed to save expense log.');
    }
  };

  const columns = [
    {
      key: 'vehicleId',
      label: 'Vehicle Plate',
      sortable: true,
      render: (val) => {
        const v = vehicleMap.get(val);
        return v ? `${v.registrationNumber} (${v.name})` : 'N/A';
      }
    },
    { 
      key: 'type', 
      label: 'Category', 
      sortable: true,
      render: (val) => <Badge variant={val === 'Fuel' ? 'success' : val === 'Maintenance' ? 'warning' : 'info'}>{val}</Badge>
    },
    { key: 'amount', label: 'Amount Charged', sortable: true, render: (val) => `$${val.toLocaleString()}` },
    { key: 'date', label: 'Billing Date', sortable: true },
    { key: 'description', label: 'Transaction Details', sortable: false }
  ];

  return (
    <PageWrapper>
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/40 dark:border-slate-800/50 pb-5">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 font-sans">
            General Expense Ledger
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-sans mt-0.5">
            Track secondary fees like tolls, permits, insurance, fuel logs, and repairs logs
          </p>
        </div>
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsAddOpen(true)}>
          Register Expense
        </Button>
      </div>

      {/* Grid Table */}
      <Table
        columns={columns}
        data={expenses}
        loading={loading}
        pageSize={5}
      />

      {/* Add Expense modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register General Expense"
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Select
            label="Assigned Vehicle (Optional)"
            placeholder="No Specific Vehicle..."
            options={vehicleOptions}
            {...register('vehicleId')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Expense Category"
              options={[
                { value: 'Tolls', label: 'Tolls & Charges' },
                { value: 'Permits', label: 'Regulatory Permits' },
                { value: 'Insurance', label: 'Insurance Fees' },
                { value: 'Other', label: 'Miscellaneous Fee' }
              ]}
              {...register('type')}
            />

            <Input
              label="Amount ($)"
              placeholder="e.g. 50"
              type="number"
              error={errors.amount?.message}
              {...register('amount', {
                required: 'Amount is required.',
                min: { value: 1, message: 'Must be greater than 0.' }
              })}
            />
          </div>

          <Input
            label="Transaction Description"
            placeholder="e.g. Toll charges for Highway 66 routing"
            error={errors.description?.message}
            {...register('description', { required: 'Details are required.' })}
          />

          <Input
            label="Billing Date"
            type="date"
            error={errors.date?.message}
            {...register('date', { required: 'Date is required.' })}
          />

          <div className="flex items-center justify-end gap-3 border-t border-slate-200/40 dark:border-slate-800/40 pt-4 mt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Expense
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
};

export default ExpenseList;
