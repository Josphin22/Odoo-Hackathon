import axios from './axios';

export const dashboardApi = {
  getKpis: () => axios.get('/reports/analytics')
};
