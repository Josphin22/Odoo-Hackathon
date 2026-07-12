// LocalStorage-backed simulation database representing Spring Boot Repository operations.

const KEYS = {
  USERS: 'transitops_users',
  VEHICLES: 'transitops_vehicles',
  DRIVERS: 'transitops_drivers',
  TRIPS: 'transitops_trips',
  MAINTENANCE: 'transitops_maintenance',
  FUEL_LOGS: 'transitops_fuel_logs',
  EXPENSES: 'transitops_expenses'
};

// Default seed data
const SEED_USERS = [
  { id: 'u-1', email: 'manager@transitops.com', password: 'password123', name: 'Marcus Vance', role: 'FLEET_MANAGER' },
  { id: 'u-2', email: 'driver@transitops.com', password: 'password123', name: 'Alex Mercer', role: 'DRIVER' },
  { id: 'u-3', email: 'safety@transitops.com', password: 'password123', name: 'Sarah Connor', role: 'SAFETY_OFFICER' },
  { id: 'u-4', email: 'finance@transitops.com', password: 'password123', name: 'David Miller', role: 'FINANCIAL_ANALYST' }
];

const SEED_VEHICLES = [
  { id: 'v-1', registrationNumber: 'KA-01-ME-1024', name: 'Taurus Heavy Cargo', type: 'Heavy Truck', maxCapacity: 15000, odometer: 125400, acquisitionCost: 75000, status: 'Available', region: 'North' },
  { id: 'v-2', registrationNumber: 'KA-01-ME-4096', name: 'Titan Hauler 400', type: 'Semi-Trailer', maxCapacity: 24000, odometer: 84300, acquisitionCost: 110000, status: 'Available', region: 'South' },
  { id: 'v-3', registrationNumber: 'KA-01-ME-0512', name: 'Sprinter Express', type: 'Light Van', maxCapacity: 1500, odometer: 45200, acquisitionCost: 35000, status: 'Available', region: 'West' },
  { id: 'v-4', registrationNumber: 'KA-01-ME-2048', name: 'Urban Cargo Carrier', type: 'Box Truck', maxCapacity: 5000, odometer: 98100, acquisitionCost: 52000, status: 'In Shop', region: 'East' },
  { id: 'v-5', registrationNumber: 'KA-01-ME-8899', name: 'Legacy Freight-01', type: 'Heavy Truck', maxCapacity: 12000, odometer: 320000, acquisitionCost: 65000, status: 'Retired', region: 'North' }
];

const SEED_DRIVERS = [
  { id: 'd-1', name: 'Alex Mercer', licenseNumber: 'DL-54321A', licenseCategory: 'Class A CDL', licenseExpiryDate: '2027-05-15', contactNumber: '+1-555-0192', safetyScore: 92, status: 'Available' },
  { id: 'd-2', name: 'Robert Chen', licenseNumber: 'DL-98765B', licenseCategory: 'Class B CDL', licenseExpiryDate: '2028-11-20', contactNumber: '+1-555-0143', safetyScore: 88, status: 'Available' },
  { id: 'd-3', name: 'Emma Watson', licenseNumber: 'DL-11223A', licenseCategory: 'Class A CDL', licenseExpiryDate: '2026-08-30', contactNumber: '+1-555-0167', safetyScore: 95, status: 'Available' },
  { id: 'd-4', name: 'John Doe', licenseNumber: 'DL-99887C', licenseCategory: 'Class C CDL', licenseExpiryDate: '2026-02-10', contactNumber: '+1-555-0121', safetyScore: 72, status: 'Available' }, // Expired (relative to current date 2026-07-12)
  { id: 'd-5', name: 'Tyler Durden', licenseNumber: 'DL-66554F', licenseCategory: 'Class A CDL', licenseExpiryDate: '2029-01-01', contactNumber: '+1-555-0188', safetyScore: 45, status: 'Suspended' }
];

const SEED_TRIPS = [
  { id: 't-1', tripNumber: 'TRIP-1001', source: 'Chicago Hub', destination: 'Detroit Depot', vehicleId: 'v-1', driverId: 'd-1', cargoWeight: 12000, plannedDistance: 450, actualDistance: 450, status: 'Completed', fuelConsumed: 180, createdAt: '2026-07-01T10:00:00Z', dispatchedAt: '2026-07-01T11:00:00Z', completedAt: '2026-07-01T19:30:00Z' },
  { id: 't-2', tripNumber: 'TRIP-1002', source: 'Houston Terminal', destination: 'Dallas Yard', vehicleId: 'v-2', driverId: 'd-2', cargoWeight: 18000, plannedDistance: 380, actualDistance: 380, status: 'Completed', fuelConsumed: 165, createdAt: '2026-07-05T08:00:00Z', dispatchedAt: '2026-07-05T09:00:00Z', completedAt: '2026-07-05T16:15:00Z' }
];

const SEED_MAINTENANCE = [
  { id: 'm-1', vehicleId: 'v-4', type: 'Brake Repair', description: 'Replace front brake pads and rotors', scheduledDate: '2026-07-10', cost: 450, status: 'Active', createdAt: '2026-07-10T09:00:00Z' },
  { id: 'm-2', vehicleId: 'v-1', type: 'Oil Change', description: 'Standard synthetic oil and filter change', scheduledDate: '2026-06-20', cost: 120, status: 'Completed', createdAt: '2026-06-20T08:00:00Z', completedAt: '2026-06-20T10:30:00Z' }
];

const SEED_FUEL = [
  { id: 'f-1', vehicleId: 'v-1', liters: 180, cost: 360, date: '2026-07-01' },
  { id: 'f-2', vehicleId: 'v-2', liters: 165, cost: 330, date: '2026-07-05' }
];

const SEED_EXPENSES = [
  { id: 'e-1', vehicleId: 'v-1', tripId: 't-1', type: 'Fuel', amount: 360, date: '2026-07-01', description: 'Fuel log autoflow' },
  { id: 'e-2', vehicleId: 'v-1', tripId: 't-1', type: 'Tolls', amount: 45, date: '2026-07-01', description: 'Interstate highway tolls' },
  { id: 'e-3', vehicleId: 'v-2', tripId: 't-2', type: 'Fuel', amount: 330, date: '2026-07-05', description: 'Fuel log autoflow' },
  { id: 'e-4', vehicleId: 'v-4', tripId: null, type: 'Maintenance', amount: 450, date: '2026-07-10', description: 'Active Brake Repair charge' },
  { id: 'e-5', vehicleId: 'v-1', tripId: null, type: 'Maintenance', amount: 120, date: '2026-06-20', description: 'Oil Change service' }
];

// Helper functions for reading/writing localStorage
const get = (key, seed) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(data);
};

const set = (key, val) => {
  localStorage.setItem(key, JSON.stringify(val));
};

const mockDb = {
  // --- USERS / AUTH ---
  users: {
    getAll: () => get(KEYS.USERS, SEED_USERS),
    getByEmail: (email) => mockDb.users.getAll().find(u => u.email.toLowerCase() === email.toLowerCase()),
    create: (user) => {
      const users = mockDb.users.getAll();
      const newUser = { id: `u-${Date.now()}`, ...user };
      users.push(newUser);
      set(KEYS.USERS, users);
      return newUser;
    }
  },

  // --- VEHICLES ---
  vehicles: {
    getAll: () => get(KEYS.VEHICLES, SEED_VEHICLES),
    getById: (id) => mockDb.vehicles.getAll().find(v => v.id === id),
    create: (vehicle) => {
      const vehicles = mockDb.vehicles.getAll();
      // Enforce Unique Registration Number Rule
      const dup = vehicles.find(v => v.registrationNumber.toLowerCase().replace(/[^a-z0-9]/g, '') === vehicle.registrationNumber.toLowerCase().replace(/[^a-z0-9]/g, ''));
      if (dup) throw new Error(`Vehicle registration number '${vehicle.registrationNumber}' already exists.`);
      
      const newVehicle = { id: `v-${Date.now()}`, odometer: Number(vehicle.odometer) || 0, maxCapacity: Number(vehicle.maxCapacity) || 0, acquisitionCost: Number(vehicle.acquisitionCost) || 0, status: 'Available', ...vehicle };
      vehicles.push(newVehicle);
      set(KEYS.VEHICLES, vehicles);
      return newVehicle;
    },
    update: (id, updatedData) => {
      const vehicles = mockDb.vehicles.getAll();
      const index = vehicles.findIndex(v => v.id === id);
      if (index === -1) throw new Error('Vehicle not found.');
      
      // Enforce Unique Registration
      if (updatedData.registrationNumber) {
        const dup = vehicles.find(v => v.id !== id && v.registrationNumber.toLowerCase().replace(/[^a-z0-9]/g, '') === updatedData.registrationNumber.toLowerCase().replace(/[^a-z0-9]/g, ''));
        if (dup) throw new Error(`Vehicle registration number '${updatedData.registrationNumber}' is registered to another vehicle.`);
      }

      vehicles[index] = { ...vehicles[index], ...updatedData };
      set(KEYS.VEHICLES, vehicles);
      return vehicles[index];
    },
    delete: (id) => {
      // Check if on trip
      const vehicle = mockDb.vehicles.getById(id);
      if (vehicle && vehicle.status === 'On Trip') throw new Error('Cannot delete vehicle while it is currently deployed on a trip.');
      
      const vehicles = mockDb.vehicles.getAll().filter(v => v.id !== id);
      set(KEYS.VEHICLES, vehicles);
      return true;
    }
  },

  // --- DRIVERS ---
  drivers: {
    getAll: () => get(KEYS.DRIVERS, SEED_DRIVERS),
    getById: (id) => mockDb.drivers.getAll().find(d => d.id === id),
    create: (driver) => {
      const drivers = mockDb.drivers.getAll();
      const newDriver = { id: `d-${Date.now()}`, safetyScore: Number(driver.safetyScore) || 90, status: 'Available', ...driver };
      drivers.push(newDriver);
      set(KEYS.DRIVERS, drivers);
      return newDriver;
    },
    update: (id, updatedData) => {
      const drivers = mockDb.drivers.getAll();
      const index = drivers.findIndex(d => d.id === id);
      if (index === -1) throw new Error('Driver not found.');

      drivers[index] = { ...drivers[index], ...updatedData };
      set(KEYS.DRIVERS, drivers);
      return drivers[index];
    },
    delete: (id) => {
      const driver = mockDb.drivers.getById(id);
      if (driver && driver.status === 'On Trip') throw new Error('Cannot delete driver while they are currently driving a trip.');

      const drivers = mockDb.drivers.getAll().filter(d => d.id !== id);
      set(KEYS.DRIVERS, drivers);
      return true;
    }
  },

  // --- TRIPS ---
  trips: {
    getAll: () => get(KEYS.TRIPS, SEED_TRIPS),
    getById: (id) => mockDb.trips.getAll().find(t => t.id === id),
    create: (trip) => {
      const trips = mockDb.trips.getAll();
      
      // Load details of vehicle and driver
      const vehicle = mockDb.vehicles.getById(trip.vehicleId);
      const driver = mockDb.drivers.getById(trip.driverId);

      if (!vehicle) throw new Error('Selected vehicle does not exist.');
      if (!driver) throw new Error('Selected driver does not exist.');

      // Enforce: Retired or In Shop vehicles must never appear in dispatch/trip creation selection.
      if (['Retired', 'In Shop'].includes(vehicle.status)) {
        throw new Error(`Vehicle is currently '${vehicle.status}' and cannot be dispatched.`);
      }

      // Enforce: Drivers with expired licenses or Suspended status cannot be assigned to trips.
      if (driver.status === 'Suspended') {
        throw new Error('This driver is Suspended and cannot be assigned.');
      }
      
      const expiry = new Date(driver.licenseExpiryDate);
      const now = new Date('2026-07-12'); // Current timeline date
      if (expiry < now) {
        throw new Error(`Driver's license expired on ${driver.licenseExpiryDate} and cannot be assigned to trips.`);
      }

      // Enforce: A driver or vehicle already marked On Trip cannot be assigned to another trip.
      if (vehicle.status === 'On Trip') {
        throw new Error('This vehicle is already dispatched on an active trip.');
      }
      if (driver.status === 'On Trip') {
        throw new Error('This driver is already assigned to an active trip.');
      }

      // Enforce: Cargo Weight must not exceed the vehicle's maximum load capacity.
      if (Number(trip.cargoWeight) > vehicle.maxCapacity) {
        throw new Error(`Cargo load (${trip.cargoWeight} kg) exceeds vehicle's maximum load capacity (${vehicle.maxCapacity} kg).`);
      }

      const tripId = `t-${Date.now()}`;
      const tripNumber = `TRIP-${trips.length + 1001}`;
      const newTrip = {
        id: tripId,
        tripNumber,
        plannedDistance: Number(trip.plannedDistance) || 0,
        cargoWeight: Number(trip.cargoWeight) || 0,
        status: 'Draft',
        createdAt: new Date().toISOString(),
        ...trip
      };

      trips.push(newTrip);
      set(KEYS.TRIPS, trips);
      return newTrip;
    },
    dispatch: (id) => {
      const trips = mockDb.trips.getAll();
      const index = trips.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Trip not found.');
      if (trips[index].status !== 'Draft') throw new Error('Only Draft trips can be dispatched.');

      const vehicle = mockDb.vehicles.getById(trips[index].vehicleId);
      const driver = mockDb.drivers.getById(trips[index].driverId);

      // Verify availability again at dispatch time
      if (vehicle.status === 'On Trip') throw new Error('Vehicle is already active on another trip.');
      if (driver.status === 'On Trip') throw new Error('Driver is already active on another trip.');

      // Update statuses to "On Trip"
      mockDb.vehicles.update(vehicle.id, { status: 'On Trip' });
      mockDb.drivers.update(driver.id, { status: 'On Trip' });

      trips[index].status = 'Dispatched';
      trips[index].dispatchedAt = new Date().toISOString();
      set(KEYS.TRIPS, trips);

      return trips[index];
    },
    complete: (id, finalOdometer, fuelConsumed) => {
      const trips = mockDb.trips.getAll();
      const index = trips.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Trip not found.');
      if (trips[index].status !== 'Dispatched') throw new Error('Only Dispatched trips can be marked completed.');

      const vehicle = mockDb.vehicles.getById(trips[index].vehicleId);
      const driver = mockDb.drivers.getById(trips[index].driverId);

      const fOdom = Number(finalOdometer);
      if (fOdom <= vehicle.odometer) {
        throw new Error(`Final odometer readings (${fOdom} km) must be greater than vehicle's current odometer (${vehicle.odometer} km).`);
      }

      const totalTripDistance = fOdom - vehicle.odometer;
      const liters = Number(fuelConsumed);

      // Complete the Trip record
      trips[index].status = 'Completed';
      trips[index].actualDistance = totalTripDistance;
      trips[index].fuelConsumed = liters;
      trips[index].completedAt = new Date().toISOString();
      set(KEYS.TRIPS, trips);

      // Restore vehicle and driver statuses to Available, and update vehicle odometer
      mockDb.vehicles.update(vehicle.id, { status: 'Available', odometer: fOdom });
      mockDb.drivers.update(driver.id, { status: 'Available' });

      // Automatically create Fuel Log & Expense entry if fuel was consumed
      if (liters > 0) {
        const fuelCost = liters * 2.0; // Assume $2.00 per liter average
        mockDb.fuelLogs.create({
          vehicleId: vehicle.id,
          liters,
          cost: fuelCost,
          date: new Date().toISOString().split('T')[0]
        });
      }

      return trips[index];
    },
    cancel: (id) => {
      const trips = mockDb.trips.getAll();
      const index = trips.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Trip not found.');

      const currentStatus = trips[index].status;
      if (currentStatus === 'Completed') throw new Error('Cannot cancel a completed trip.');

      trips[index].status = 'Cancelled';
      set(KEYS.TRIPS, trips);

      // If the trip was dispatched, we need to release driver and vehicle
      if (currentStatus === 'Dispatched') {
        mockDb.vehicles.update(trips[index].vehicleId, { status: 'Available' });
        mockDb.drivers.update(trips[index].driverId, { status: 'Available' });
      }

      return trips[index];
    }
  },

  // --- MAINTENANCE ---
  maintenance: {
    getAll: () => get(KEYS.MAINTENANCE, SEED_MAINTENANCE),
    getById: (id) => mockDb.maintenance.getAll().find(m => m.id === id),
    create: (log) => {
      const logs = mockDb.maintenance.getAll();
      const vehicle = mockDb.vehicles.getById(log.vehicleId);
      if (!vehicle) throw new Error('Vehicle not found.');
      if (vehicle.status === 'On Trip') throw new Error('Cannot schedule maintenance. Vehicle is currently on a trip.');

      const logId = `m-${Date.now()}`;
      const newLog = {
        id: logId,
        cost: Number(log.cost) || 0,
        status: 'Active',
        createdAt: new Date().toISOString(),
        ...log
      };

      logs.push(newLog);
      set(KEYS.MAINTENANCE, logs);

      // Enforce: Creating an active maintenance record automatically changes vehicle status to In Shop
      mockDb.vehicles.update(vehicle.id, { status: 'In Shop' });

      // Automatically register expense
      mockDb.expenses.create({
        vehicleId: vehicle.id,
        tripId: null,
        type: 'Maintenance',
        amount: Number(log.cost) || 0,
        date: log.scheduledDate || new Date().toISOString().split('T')[0],
        description: `Scheduled maintenance: ${log.type}`
      });

      return newLog;
    },
    complete: (id, finalCost) => {
      const logs = mockDb.maintenance.getAll();
      const index = logs.findIndex(m => m.id === id);
      if (index === -1) throw new Error('Maintenance log not found.');
      if (logs[index].status === 'Completed') throw new Error('Maintenance is already completed.');

      logs[index].status = 'Completed';
      logs[index].completedAt = new Date().toISOString();
      if (finalCost !== undefined) {
        logs[index].cost = Number(finalCost);
      }
      set(KEYS.MAINTENANCE, logs);

      // Enforce: Closing maintenance restores the vehicle to Available (unless retired)
      const vehicle = mockDb.vehicles.getById(logs[index].vehicleId);
      if (vehicle && vehicle.status !== 'Retired') {
        mockDb.vehicles.update(vehicle.id, { status: 'Available' });
      }

      return logs[index];
    }
  },

  // --- FUEL LOGS ---
  fuelLogs: {
    getAll: () => get(KEYS.FUEL_LOGS, SEED_FUEL),
    create: (log) => {
      const logs = mockDb.fuelLogs.getAll();
      const logId = `f-${Date.now()}`;
      const newLog = {
        id: logId,
        liters: Number(log.liters) || 0,
        cost: Number(log.cost) || 0,
        ...log
      };
      logs.push(newLog);
      set(KEYS.FUEL_LOGS, logs);

      // Add to expenses
      mockDb.expenses.create({
        vehicleId: log.vehicleId,
        tripId: null,
        type: 'Fuel',
        amount: Number(log.cost) || 0,
        date: log.date || new Date().toISOString().split('T')[0],
        description: `Refueled: ${log.liters} liters`
      });

      return newLog;
    }
  },

  // --- EXPENSES ---
  expenses: {
    getAll: () => get(KEYS.EXPENSES, SEED_EXPENSES),
    create: (exp) => {
      const exps = mockDb.expenses.getAll();
      const expId = `e-${Date.now()}`;
      const newExp = {
        id: expId,
        amount: Number(exp.amount) || 0,
        ...exp
      };
      exps.push(newExp);
      set(KEYS.EXPENSES, exps);
      return newExp;
    }
  }
};

export default mockDb;
