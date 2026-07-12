import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

const RoleRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullPage message="Verifying access credentials..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if role is authorized
  const hasAccess = user?.role === 'ADMIN' || allowedRoles.includes(user?.role);
  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleRoute;
