import axios from './axios';

export const tripApi = {
  getAll: () => axios.get('/trips'),
  getById: (id) => axios.get(`/trips/${id}`),
  create: (data) => axios.post('/trips', data),
  dispatch: (id) => axios.put(`/trips/${id}/dispatch`),
  complete: (id, finalOdometer, fuelConsumed) => axios.put(`/trips/${id}/complete`, { finalOdometer, fuelConsumed }),
  cancel: (id) => axios.put(`/trips/${id}/cancel`),
  update: (id, data) => axios.put(`/trips/${id}`, data)
};
