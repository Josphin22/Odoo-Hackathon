import React, { useEffect, useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useForm } from 'react-hook-form';
import { maintenanceApi } from '../../api/maintenanceApi';
import { useVehicleStore } from '../../store/vehicleStore';
import { useNotification } from '../../context/NotificationContext';
import { Plus, CheckCircle, Wrench } from 'lucide-react';

const MaintenanceList = () => {
  const { vehicles, fetchVehicles } = useVehicleStore();
  const { showSuccess, showError } = useNotification();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [logToClose, setLogToClose] = useState(null);

  const { register: registerSched, handleSubmit: handleSubmitSched, reset: resetSched, formState: { errors: errorsSched } } = useForm({
    defaultValues: {
      vehicleId: '',
      type: 'Oil Change',
      description: '',
      scheduledDate: '',
      cost: ''
    }
  });

  const { register: registerClose, handleSubmit: handleSubmitClose, reset: resetClose, formState: { errors: errorsClose } } = useForm({
    defaultValues: {
      cost: ''
    }
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await maintenanceApi.getAll();
      setLogs(res.data);
    } catch (err) {
      showError('Failed to fetch maintenance registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchVehicles();
  }, [fetchVehicles]);

  const vehicleMap = useMemo(() => new Map(vehicles.map(v => [v.id, v])), [vehicles]);

  // Exclude vehicles that are currently On Trip or Retired
  const eligibleVehicles = useMemo(() => {
    return vehicles
      .filter(v => v.status === 'Available')
      .map(v => ({
        value: v.id,
        label: `${v.name} (${v.registrationNumber})`
      }));
  }, [vehicles]);

  const handleScheduleSubmit = async (data) => {
    try {
      await maintenanceApi.create({
        ...data,
        cost: Number(data.cost)
      });
      showSuccess('Maintenance log registered! Vehicle status set to In Shop.');
      setIsScheduleOpen(false);
      resetSched();
      fetchLogs();
      fetchVehicles();
    } catch (err) {
      showError(err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleCloseTrigger = (log) => {
    setLogToClose(log);
    resetClose({ cost: String(log.cost) });
    setIsCloseOpen(true);
  };

  const handleCloseSubmit = async (data) => {
    try {
      await maintenanceApi.complete(logToClose.id, Number(data.cost));
      showSuccess('Maintenance record closed! Vehicle status restored.');
      setIsCloseOpen(false);
      fetchLogs();
      fetchVehicles();
    } catch (err) {
      showError(err.response?.data?.message || 'Operation failed.');
    }
  };

  const columns = [
    { 
      key: 'vehicleId', 
      label: 'Vehicle Plate', 
      sortable: true,
      render: (val) => {
        const v = vehicleMap.get(val);
        return v ? (
          <div className="flex flex-col">
            <span className="font-mono font-semibold text-xs tracking-wider text-slate-800 dark:text-slate-200">{v.registrationNumber}</span>
            <span className="text-[10px] text-slate-400">{v.name}</span>
          </div>
        ) : 'Loading...';
      }
    },
    { key: 'type', label: 'Service Category', sortable: true },
    { key: 'description', label: 'Description/Fault', sortable: false, className: 'max-w-xs truncate' },
    { key: 'scheduledDate', label: 'Service Date', sortable: true },
    { key: 'cost', label: 'Estimated Cost', sortable: true, render: (val) => `$${val.toLocaleString()}` },
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
      render: (_, row) => {
        if (row.status === 'Active') {
          return (
            <Button 
              variant="secondary" 
              size="sm" 
              icon={CheckCircle}
              onClick={() => handleCloseTrigger(row)}
            >
              Close Record
            </Button>
          );
        }
        return <span className="text-xs text-slate-400 font-sans font-medium">Completed</span>;
      }
    }
  ];

  return (
    <PageWrapper>
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/40 dark:border-slate-800/50 pb-5">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 font-sans">
            Fleet Maintenance Log
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-sans mt-0.5">
            Schedule vehicle repairs, inspect active maintenance logs, and manage mechanical availability
          </p>
        </div>
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsScheduleOpen(true)}>
          Schedule Service
        </Button>
      </div>

      {/* Grid Table */}
      <Table
        columns={columns}
        data={logs}
        loading={loading}
        pageSize={5}
      />

      {/* Schedule Service Modal */}
      <Modal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        title="Schedule Vehicle Maintenance"
        size="md"
      >
        <form onSubmit={handleSubmitSched(handleScheduleSubmit)} className="flex flex-col gap-4.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Select Vehicle"
              placeholder="Select Available Vehicle..."
              options={eligibleVehicles}
              error={errorsSched.vehicleId?.message}
              {...registerSched('vehicleId', { required: 'Vehicle assignment is required.' })}
            />

            <Select
              label="Service Type"
              options={[
                { value: 'Oil Change', label: 'Oil Change & Inspection' },
                { value: 'Brake Repair', label: 'Brake Repair & Bleeding' },
                { value: 'Engine Overhaul', label: 'Engine Repair & Tuning' },
                { value: 'Tire Rotation', label: 'Tire Rotation & Balance' },
                { value: 'Electrical Fix', label: 'Electrical Wiring Inspection' }
              ]}
              {...registerSched('type')}
            />
          </div>

          <Input
            label="Service Description"
            placeholder="e.g. Squeaking front brakes, check brake pad wear logs."
            error={errorsSched.description?.message}
            {...registerSched('description', { required: 'Description is required.' })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Scheduled Date"
              type="date"
              error={errorsSched.scheduledDate?.message}
              {...registerSched('scheduledDate', { required: 'Date is required.' })}
            />

            <Input
              label="Estimated Cost ($)"
              placeholder="e.g. 500"
              type="number"
              error={errorsSched.cost?.message}
              {...registerSched('cost', { 
                required: 'Cost estimate is required.',
                min: { value: 1, message: 'Must be greater than 0.' }
              })}
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200/40 dark:border-slate-800/40 pt-4.5 mt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsScheduleOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Schedule & Log
            </Button>
          </div>
        </form>
      </Modal>

      {/* Close Maintenance Modal */}
      <Modal
        isOpen={isCloseOpen}
        onClose={() => setIsCloseOpen(false)}
        title="Close Maintenance Ticket"
        size="sm"
      >
        {logToClose && (
          <form onSubmit={handleSubmitClose(handleCloseSubmit)} className="flex flex-col gap-4">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-sans">
              Enter final maintenance bill amount to close ticket for vehicle plate: <span className="font-bold underline">{vehicleMap.get(logToClose.vehicleId)?.registrationNumber}</span>.
            </p>

            <Input
              label="Actual Maintenance Bill Cost ($)"
              placeholder="e.g. 480"
              type="number"
              error={errorsClose.cost?.message}
              {...registerClose('cost', { 
                required: 'Actual cost is required.',
                min: { value: 0, message: 'Cost cannot be negative.' }
              })}
            />

            <div className="flex items-center justify-end gap-3 border-t border-slate-200/40 dark:border-slate-800/40 pt-4 mt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsCloseOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Close Ticket
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </PageWrapper>
  );
};

export default MaintenanceList;
