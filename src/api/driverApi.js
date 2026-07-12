import axios from './axios';

export const driverApi = {
  getAll: () => axios.get('/drivers'),
  getById: (id) => axios.get(`/drivers/${id}`),
  create: (data) => axios.post('/drivers', data),
  update: (id, data) => axios.put(`/drivers/${id}`, data),
  delete: (id) => axios.delete(`/drivers/${id}`)
};
