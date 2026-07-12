import { create } from 'zustand';
import { authApi } from '../api/authApi';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: sessionStorage.getItem('transitops_token') || null,
  loading: false,
  error: null,

  login: async (email, password, rememberMe) => {
    set({ loading: true, error: null });
    try {
      const res = await authApi.login({ email, password });
      const { token, name, role } = res.data;
      
      sessionStorage.setItem('transitops_token', token);
      if (rememberMe) {
        localStorage.setItem('transitops_remembered_email', email);
      } else {
        localStorage.removeItem('transitops_remembered_email');
      }

      set({ token, user: { name, role, email }, loading: false });
      return { name, role, email };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  logout: () => {
    sessionStorage.removeItem('transitops_token');
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    const token = sessionStorage.getItem('transitops_token');
    if (!token) {
      set({ user: null, token: null });
      return;
    }
    set({ loading: true });
    try {
      const res = await authApi.getProfile();
      set({ user: res.data, token, loading: false });
    } catch (err) {
      // Token is invalid/expired
      sessionStorage.removeItem('transitops_token');
      set({ user: null, token: null, loading: false });
    }
  },

  updateProfile: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await authApi.updateProfile(data);
      const updatedUser = res.data;
      set((state) => ({
        user: { ...state.user, name: updatedUser.name },
        loading: false
      }));
      return updatedUser;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update profile.';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  }
}));
