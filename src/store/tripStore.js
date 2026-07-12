import { create } from 'zustand';
import { tripApi } from '../api/tripApi';

export const useTripStore = create((set) => ({
  trips: [],
  loading: false,
  error: null,

  fetchTrips: async () => {
    set({ loading: true, error: null });
    try {
      const res = await tripApi.getAll();
      set({ trips: res.data, loading: false });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to fetch trips.';
      set({ error: errMsg, loading: false });
    }
  },

  createTrip: async (tripData) => {
    set({ loading: true, error: null });
    try {
      const res = await tripApi.create(tripData);
      set((state) => ({
        trips: [res.data, ...state.trips],
        loading: false
      }));
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to create trip.';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  dispatchTrip: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await tripApi.dispatch(id);
      set((state) => ({
        trips: state.trips.map((t) => (t.id === id ? res.data : t)),
        loading: false
      }));
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to dispatch trip.';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  completeTrip: async (id, finalOdometer, fuelConsumed) => {
    set({ loading: true, error: null });
    try {
      const res = await tripApi.complete(id, finalOdometer, fuelConsumed);
      set((state) => ({
        trips: state.trips.map((t) => (t.id === id ? res.data : t)),
        loading: false
      }));
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to complete trip.';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  cancelTrip: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await tripApi.cancel(id);
      set((state) => ({
        trips: state.trips.map((t) => (t.id === id ? res.data : t)),
        loading: false
      }));
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to cancel trip.';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  }
}));
