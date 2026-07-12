import { create } from 'zustand';
import { reportApi } from '../api/reportApi';

export const useReportStore = create((set) => ({
  roi: [],
  fuelEfficiency: [],
  expenses: [],
  loading: false,
  error: null,

  fetchReportsData: async () => {
    set({ loading: true, error: null });
    try {
      const res = await reportApi.getAnalytics();
      const { roi, fuelEfficiency, expenses } = res.data;
      set({
        roi,
        fuelEfficiency,
        expenses,
        loading: false
      });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to fetch report metrics.';
      set({ error: errMsg, loading: false });
    }
  }
}));
