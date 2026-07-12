import axios from './axios';

export const authApi = {
  login: (credentials) => axios.post('/auth/login', credentials),
  getProfile: () => axios.get('/profile'),
  updateProfile: (data) => axios.put('/profile', data)
};
