import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Pages
import Login from '../pages/auth/Login';
import Unauthorized from '../pages/auth/Unauthorized';
import Dashboard from '../pages/dashboard/Dashboard';
import VehicleList from '../pages/vehicles/VehicleList';
import DriverList from '../pages/drivers/DriverList';
import TripList from '../pages/trips/TripList';
import MaintenanceList from '../pages/maintenance/MaintenanceList';
import FuelLogs from '../pages/fuel/FuelLogs';
import ExpenseList from '../pages/expenses/ExpenseList';
import Reports from '../pages/reports/Reports';
import Profile from '../pages/profile/Profile';

// Admin Pages
import EmployeeManager from '../pages/admin/EmployeeManager';
import RolePermissionMatrix from '../pages/admin/RolePermissionMatrix';
import AuditHistory from '../pages/admin/AuditHistory';
import CompanySettings from '../pages/admin/CompanySettings';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes (Main Layout Shell) */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Redirect base path */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard (All Roles) */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* Admin Modules */}
        <Route 
          path="admin/employees" 
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <EmployeeManager />
            </RoleRoute>
          } 
        />

        <Route 
          path="admin/roles" 
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <RolePermissionMatrix />
            </RoleRoute>
          } 
        />

        <Route 
          path="admin/audit-logs" 
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <AuditHistory />
            </RoleRoute>
          } 
        />

        <Route 
          path="admin/company-settings" 
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <CompanySettings />
            </RoleRoute>
          } 
        />

        {/* Vehicle Registry (Managers and Safety Officers) */}
        <Route 
          path="vehicles" 
          element={
            <RoleRoute allowedRoles={['FLEET_MANAGER', 'SAFETY_OFFICER']}>
              <VehicleList />
            </RoleRoute>
          } 
        />

        {/* Drivers Directory (Managers and Safety Officers) */}
        <Route 
          path="drivers" 
          element={
            <RoleRoute allowedRoles={['FLEET_MANAGER', 'SAFETY_OFFICER']}>
              <DriverList />
            </RoleRoute>
          } 
        />

        {/* Trips Dispatch (Managers, Drivers, Safety Officers) */}
        <Route 
          path="trips" 
          element={
            <RoleRoute allowedRoles={['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'DISPATCHER']}>
              <TripList />
            </RoleRoute>
          } 
        />

        {/* Maintenance (Managers only) */}
        <Route 
          path="maintenance" 
          element={
            <RoleRoute allowedRoles={['FLEET_MANAGER']}>
              <MaintenanceList />
            </RoleRoute>
          } 
        />

        {/* Fuel Logs (Managers, Drivers, Financial Analysts) */}
        <Route 
          path="fuel" 
          element={
            <RoleRoute allowedRoles={['FLEET_MANAGER', 'DRIVER', 'FINANCIAL_ANALYST']}>
              <FuelLogs />
            </RoleRoute>
          } 
        />

        {/* Expenses (Managers, Financial Analysts) */}
        <Route 
          path="expenses" 
          element={
            <RoleRoute allowedRoles={['FLEET_MANAGER', 'FINANCIAL_ANALYST']}>
              <ExpenseList />
            </RoleRoute>
          } 
        />

        {/* Reports (Managers, Financial Analysts) */}
        <Route 
          path="reports" 
          element={
            <RoleRoute allowedRoles={['FLEET_MANAGER', 'FINANCIAL_ANALYST']}>
              <Reports />
            </RoleRoute>
          } 
        />

        {/* Profile Settings (All Roles) */}
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Fallback Catch-All */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
