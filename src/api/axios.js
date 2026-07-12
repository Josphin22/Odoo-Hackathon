// Axios Mock Client representing standard REST API calls to a Spring Boot backend.
import mockDb from './mockDb';

// Helper to simulate network latency
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Retrieve user session from sessionStorage
const getSessionToken = () => sessionStorage.getItem('transitops_token');

// Axios interceptor & wrapper
const axiosInstance = {
  defaults: {
    baseURL: '/api',
    headers: {
      common: {}
    }
  },

  // Interceptors placeholder for structural parity
  interceptors: {
    request: {
      use: (successFn, errorFn) => {
        // Mock register request interceptor
      }
    },
    response: {
      use: (successFn, errorFn) => {
        // Mock register response interceptor
      }
    }
  },

  // HTTP Helper wrapper to simulate REST controllers
  request: async (config) => {
    await delay();

    const { url, method, data, headers } = config;
    const token = getSessionToken();
    const cleanUrl = url.replace(/^\/api/, ''); // Strip base prefix

    // 1. Auth Gate (except login)
    if (cleanUrl !== '/auth/login' && !token) {
      return Promise.reject({
        response: { status: 401, data: { message: 'Unauthorized: Session token missing or expired.' } }
      });
    }

    let userRole = null;
    if (token) {
      try {
        const decoded = JSON.parse(atob(token));
        userRole = decoded.role;
      } catch (e) {
        return Promise.reject({
          response: { status: 401, data: { message: 'Unauthorized: Invalid token format.' } }
        });
      }
    }

    try {
      // --- ROUTER HANDLERS ---
      
      // POST: LOGIN
      if (cleanUrl === '/auth/login' && method === 'POST') {
        const { email, password } = data;
        const user = mockDb.users.getByEmail(email);
        if (!user || user.password !== password) {
          return Promise.reject({
            response: { status: 400, data: { message: 'Invalid credentials. Please try again.' } }
          });
        }
        // Generate mock JWT (Base64 encoding user data)
        const mockJwt = btoa(JSON.stringify({ id: user.id, email: user.email, role: user.role, name: user.name }));
        return { status: 200, data: { token: mockJwt, name: user.name, role: user.role, email: user.email } };
      }

      // GET: CURRENT PROFILE
      if (cleanUrl === '/profile' && method === 'GET') {
        const decoded = JSON.parse(atob(token));
        const user = mockDb.users.getByEmail(decoded.email);
        if (!user) return Promise.reject({ response: { status: 440, data: { message: 'Session expired.' } } });
        return { status: 200, data: { name: user.name, email: user.email, role: user.role } };
      }

      // PUT: PROFILE UPDATE
      if (cleanUrl === '/profile' && method === 'PUT') {
        const decoded = JSON.parse(atob(token));
        const users = mockDb.users.getAll();
        const idx = users.findIndex(u => u.id === decoded.id);
        if (idx !== -1) {
          users[idx].name = data.name;
          if (data.password) users[idx].password = data.password;
          localStorage.setItem('transitops_users', JSON.stringify(users));
          return { status: 200, data: { name: users[idx].name, email: users[idx].email, role: users[idx].role } };
        }
        return Promise.reject({ response: { status: 404, data: { message: 'User profile not found.' } } });
      }

      // --- VEHICLES API ---
      if (cleanUrl.startsWith('/vehicles')) {
        const parts = cleanUrl.split('/');
        const id = parts[2]; // /vehicles/{id}

        if (method === 'GET') {
          if (id) {
            const vehicle = mockDb.vehicles.getById(id);
            if (!vehicle) return Promise.reject({ response: { status: 404, data: { message: 'Vehicle not found.' } } });
            return { status: 200, data: vehicle };
          }
          return { status: 200, data: mockDb.vehicles.getAll() };
        }

        // Write Operations require FLEET_MANAGER
        if (userRole !== 'FLEET_MANAGER') {
          return Promise.reject({ response: { status: 403, data: { message: 'Forbidden: Access Denied. Fleet Manager clearance needed.' } } });
        }

        if (method === 'POST') {
          const newV = mockDb.vehicles.create(data);
          return { status: 201, data: newV };
        }
        if (method === 'PUT' && id) {
          const updV = mockDb.vehicles.update(id, data);
          return { status: 200, data: updV };
        }
        if (method === 'DELETE' && id) {
          mockDb.vehicles.delete(id);
          return { status: 200, data: { message: 'Vehicle deleted successfully.' } };
        }
      }

      // --- DRIVERS API ---
      if (cleanUrl.startsWith('/drivers')) {
        const parts = cleanUrl.split('/');
        const id = parts[2];

        if (method === 'GET') {
          if (id) {
            const driver = mockDb.drivers.getById(id);
            if (!driver) return Promise.reject({ response: { status: 404, data: { message: 'Driver profile not found.' } } });
            return { status: 200, data: driver };
          }
          return { status: 200, data: mockDb.drivers.getAll() };
        }

        // Safety Officers can edit safety attributes, Managers can edit driver profiles
        if (!['FLEET_MANAGER', 'SAFETY_OFFICER'].includes(userRole)) {
          return Promise.reject({ response: { status: 403, data: { message: 'Forbidden: Admin privilege required.' } } });
        }

        if (method === 'POST') {
          const newD = mockDb.drivers.create(data);
          return { status: 201, data: newD };
        }
        if (method === 'PUT' && id) {
          const updD = mockDb.drivers.update(id, data);
          return { status: 200, data: updD };
        }
        if (method === 'DELETE' && id) {
          mockDb.drivers.delete(id);
          return { status: 200, data: { message: 'Driver profile deleted successfully.' } };
        }
      }

      // --- TRIPS API ---
      if (cleanUrl.startsWith('/trips')) {
        const parts = cleanUrl.split('/');
        const id = parts[2];
        const subAction = parts[3]; // /trips/{id}/dispatch

        if (method === 'GET') {
          if (id) {
            const trip = mockDb.trips.getById(id);
            if (!trip) return Promise.reject({ response: { status: 404, data: { message: 'Trip record not found.' } } });
            return { status: 200, data: trip };
          }
          return { status: 200, data: mockDb.trips.getAll() };
        }

        // Driver role is limited to viewing trips. Creating/Dispatching/Cancelling/Completing requires specific rules.
        if (method === 'POST') {
          if (!['FLEET_MANAGER', 'DRIVER'].includes(userRole)) {
            return Promise.reject({ response: { status: 403, data: { message: 'Forbidden: Drivers or Managers only.' } } });
          }
          const newT = mockDb.trips.create(data);
          return { status: 201, data: newT };
        }

        if (method === 'PUT' && id) {
          if (subAction === 'dispatch') {
            if (userRole !== 'FLEET_MANAGER') return Promise.reject({ response: { status: 403, data: { message: 'Only managers can dispatch trips.' } } });
            const dispT = mockDb.trips.dispatch(id);
            return { status: 200, data: dispT };
          }
          if (subAction === 'complete') {
            const completedT = mockDb.trips.complete(id, data.finalOdometer, data.fuelConsumed);
            return { status: 200, data: completedT };
          }
          if (subAction === 'cancel') {
            const cancelledT = mockDb.trips.cancel(id);
            return { status: 200, data: cancelledT };
          }
          const updatedT = mockDb.trips.update(id, data);
          return { status: 200, data: updatedT };
        }
      }

      // --- MAINTENANCE API ---
      if (cleanUrl.startsWith('/maintenance')) {
        const parts = cleanUrl.split('/');
        const id = parts[2];
        const action = parts[3];

        if (method === 'GET') {
          return { status: 200, data: mockDb.maintenance.getAll() };
        }

        if (method === 'POST') {
          if (userRole !== 'FLEET_MANAGER') return Promise.reject({ response: { status: 403, data: { message: 'Managers only.' } } });
          const newL = mockDb.maintenance.create(data);
          return { status: 201, data: newL };
        }

        if (method === 'PUT' && id && action === 'complete') {
          if (userRole !== 'FLEET_MANAGER') return Promise.reject({ response: { status: 403, data: { message: 'Managers only.' } } });
          const compL = mockDb.maintenance.complete(id, data.cost);
          return { status: 200, data: compL };
        }
      }

      // --- FUEL API ---
      if (cleanUrl.startsWith('/fuel')) {
        if (method === 'GET') {
          return { status: 200, data: mockDb.fuelLogs.getAll() };
        }
        if (method === 'POST') {
          const newF = mockDb.fuelLogs.create(data);
          return { status: 201, data: newF };
        }
      }

      // --- EXPENSES API ---
      if (cleanUrl.startsWith('/expenses')) {
        if (method === 'GET') {
          return { status: 200, data: mockDb.expenses.getAll() };
        }
        if (method === 'POST') {
          const newE = mockDb.expenses.create(data);
          return { status: 201, data: newE };
        }
      }

      // --- ANALYTICS / REPORTS API ---
      if (cleanUrl === '/reports/analytics' && method === 'GET') {
        const vehicles = mockDb.vehicles.getAll();
        const trips = mockDb.trips.getAll();
        const fuelLogs = mockDb.fuelLogs.getAll();
        const expenses = mockDb.expenses.getAll();
        const mLogs = mockDb.maintenance.getAll();

        const totalVehicles = vehicles.length;
        const activeVehicles = vehicles.filter(v => v.status === 'On Trip').length;
        const inShopVehicles = vehicles.filter(v => v.status === 'In Shop').length;
        const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
        const utilization = totalVehicles > 0 ? Math.round(((activeVehicles) / totalVehicles) * 100) : 0;

        // ROI calculation: (Revenue - (Fuel + Maint)) / Acquisition Cost
        // Assume mock revenue of $2.5 per km completed
        const ROI_METRIC = vehicles.map(v => {
          const vehicleTrips = trips.filter(t => t.vehicleId === v.id && t.status === 'Completed');
          const distanceCompleted = vehicleTrips.reduce((acc, t) => acc + (t.actualDistance || 0), 0);
          const revenue = distanceCompleted * 2.5;

          const vehicleFuel = fuelLogs.filter(f => f.vehicleId === v.id).reduce((acc, f) => acc + f.cost, 0);
          const vehicleMaint = mLogs.filter(m => m.vehicleId === v.id).reduce((acc, m) => acc + m.cost, 0);
          const operationalCost = vehicleFuel + vehicleMaint;

          const roi = v.acquisitionCost > 0 
            ? parseFloat((((revenue - operationalCost) / v.acquisitionCost) * 100).toFixed(2)) 
            : 0;

          return {
            id: v.id,
            name: v.name,
            registrationNumber: v.registrationNumber,
            revenue,
            operationalCost,
            fuelCost: vehicleFuel,
            maintenanceCost: vehicleMaint,
            acquisitionCost: v.acquisitionCost,
            roi
          };
        });

        // Fuel efficiency calculation
        const FUEL_EFFICIENCY = vehicles.map(v => {
          const vehicleTrips = trips.filter(t => t.vehicleId === v.id && t.status === 'Completed');
          const distance = vehicleTrips.reduce((acc, t) => acc + (t.actualDistance || 0), 0);
          const fuel = fuelLogs.filter(f => f.vehicleId === v.id).reduce((acc, f) => acc + f.liters, 0);
          const efficiency = fuel > 0 ? parseFloat((distance / fuel).toFixed(2)) : 0; // km per liter
          return { id: v.id, name: v.name, registrationNumber: v.registrationNumber, distance, fuelUsed: fuel, efficiency };
        });

        return {
          status: 200,
          data: {
            kpi: {
              totalVehicles,
              activeVehicles,
              inShopVehicles,
              availableVehicles,
              utilization,
              totalTrips: trips.length,
              pendingTrips: trips.filter(t => t.status === 'Draft').length,
              activeTrips: trips.filter(t => t.status === 'Dispatched').length,
              driversOnDuty: mockDb.drivers.getAll().filter(d => d.status === 'Available' || d.status === 'On Trip').length
            },
            roi: ROI_METRIC,
            fuelEfficiency: FUEL_EFFICIENCY,
            expenses: expenses
          }
        };
      }

      // Return 404 for unhandled paths
      return Promise.reject({
        response: { status: 404, data: { message: `Endpoint not found: ${method} ${cleanUrl}` } }
      });

    } catch (err) {
      return Promise.reject({
        response: { status: 400, data: { message: err.message } }
      });
    }
  },

  // Verb aliases
  get: (url, config = {}) => axiosInstance.request({ ...config, url, method: 'GET' }),
  post: (url, data, config = {}) => axiosInstance.request({ ...config, url, data, method: 'POST' }),
  put: (url, data, config = {}) => axiosInstance.request({ ...config, url, data, method: 'PUT' }),
  patch: (url, data, config = {}) => axiosInstance.request({ ...config, url, data, method: 'PATCH' }),
  delete: (url, config = {}) => axiosInstance.request({ ...config, url, method: 'DELETE' })
};

export default axiosInstance;
