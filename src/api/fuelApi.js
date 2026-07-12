import axios from './axios';

export const fuelApi = {
  getAll: () => axios.get('/fuel'),
  create: (data) => axios.post('/fuel', data)
};
