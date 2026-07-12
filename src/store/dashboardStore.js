import { create } from 'zustand';
import { dashboardApi } from '../api/dashboardApi';

export const useDashboardStore = create((set) => ({
  kpis: null,
  roi: [],
  fuelEfficiency: [],
  expenses: [],
  loading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ loading: true, error: null });
    try {
      const res = await dashboardApi.getKpis();
      const { kpi, roi, fuelEfficiency, expenses } = res.data;
      set({
        kpis: kpi,
        roi,
        fuelEfficiency,
        expenses,
        loading: false
      });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to fetch dashboard and analytics data.';
      set({ error: errMsg, loading: false });
    }
  }
}));
