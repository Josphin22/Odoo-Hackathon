import axios from './axios';

export const vehicleApi = {
  getAll: () => axios.get('/vehicles'),
  getById: (id) => axios.get(`/vehicles/${id}`),
  create: (data) => axios.post('/vehicles', data),
  update: (id, data) => axios.put(`/vehicles/${id}`, data),
  delete: (id) => axios.delete(`/vehicles/${id}`)
};
