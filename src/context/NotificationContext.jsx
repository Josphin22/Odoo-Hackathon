import React, { createContext, useContext } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const showSuccess = (message) => toast.success(message, {
    style: {
      borderRadius: '12px',
      background: '#1E293B',
      color: '#FFF',
      fontFamily: 'Outfit, sans-serif',
      fontSize: '0.875rem',
      border: '1px solid rgba(255, 255, 255, 0.08)'
    }
  });

  const showError = (message) => toast.error(message, {
    style: {
      borderRadius: '12px',
      background: '#1E293B',
      color: '#FFF',
      fontFamily: 'Outfit, sans-serif',
      fontSize: '0.875rem',
      border: '1px solid rgba(255, 255, 255, 0.08)'
    }
  });

  const showInfo = (message) => toast(message, {
    icon: 'ℹ️',
    style: {
      borderRadius: '12px',
      background: '#1E293B',
      color: '#FFF',
      fontFamily: 'Outfit, sans-serif',
      fontSize: '0.875rem',
      border: '1px solid rgba(255, 255, 255, 0.08)'
    }
  });

  return (
    <NotificationContext.Provider value={{ showSuccess, showError, showInfo }}>
      <Toaster position="top-right" reverseOrder={false} />
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
