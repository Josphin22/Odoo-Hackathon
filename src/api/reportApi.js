import axios from './axios';

export const reportApi = {
  getAnalytics: () => axios.get('/reports/analytics')
};
