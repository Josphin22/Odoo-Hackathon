import axios from './axios';

export const expenseApi = {
  getAll: () => axios.get('/expenses'),
  create: (data) => axios.post('/expenses', data)
};
