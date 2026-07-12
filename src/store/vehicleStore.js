import { create } from 'zustand';
import { vehicleApi } from '../api/vehicleApi';

export const useVehicleStore = create((set) => ({
  vehicles: [],
  loading: false,
  error: null,

  fetchVehicles: async () => {
    set({ loading: true, error: null });
    try {
      const res = await vehicleApi.getAll();
      set({ vehicles: res.data, loading: false });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to fetch vehicles.';
      set({ error: errMsg, loading: false });
    }
  },

  addVehicle: async (vehicleData) => {
    set({ loading: true, error: null });
    try {
      const res = await vehicleApi.create(vehicleData);
      set((state) => ({
        vehicles: [...state.vehicles, res.data],
        loading: false
      }));
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to add vehicle.';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  updateVehicle: async (id, vehicleData) => {
    set({ loading: true, error: null });
    try {
      const res = await vehicleApi.update(id, vehicleData);
      set((state) => ({
        vehicles: state.vehicles.map((v) => (v.id === id ? res.data : v)),
        loading: false
      }));
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update vehicle.';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  deleteVehicle: async (id) => {
    set({ loading: true, error: null });
    try {
      await vehicleApi.delete(id);
      set((state) => ({
        vehicles: state.vehicles.filter((v) => v.id !== id),
        loading: false
      }));
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to delete vehicle.';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  }
}));
