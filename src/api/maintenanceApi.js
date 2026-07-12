import axios from './axios';

export const maintenanceApi = {
  getAll: () => axios.get('/maintenance'),
  create: (data) => axios.post('/maintenance', data),
  complete: (id, cost) => axios.put(`/maintenance/${id}/complete`, { cost })
};
