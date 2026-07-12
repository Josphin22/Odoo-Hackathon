import { create } from 'zustand';
import { driverApi } from '../api/driverApi';

export const useDriverStore = create((set) => ({
  drivers: [],
  loading: false,
  error: null,

  fetchDrivers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await driverApi.getAll();
      set({ drivers: res.data, loading: false });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to fetch drivers.';
      set({ error: errMsg, loading: false });
    }
  },

  addDriver: async (driverData) => {
    set({ loading: true, error: null });
    try {
      const res = await driverApi.create(driverData);
      set((state) => ({
        drivers: [...state.drivers, res.data],
        loading: false
      }));
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to add driver.';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  updateDriver: async (id, driverData) => {
    set({ loading: true, error: null });
    try {
      const res = await driverApi.update(id, driverData);
      set((state) => ({
        drivers: state.drivers.map((d) => (d.id === id ? res.data : d)),
        loading: false
      }));
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update driver.';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  deleteDriver: async (id) => {
    set({ loading: true, error: null });
    try {
      await driverApi.delete(id);
      set((state) => ({
        drivers: state.drivers.filter((d) => d.id !== id),
        loading: false
      }));
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to delete driver.';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  }
}));
