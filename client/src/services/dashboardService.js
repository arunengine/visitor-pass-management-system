/**
 * Frontend Dashboard Service
 * Purpose: Axios API calls for live dashboard analytics data.
 */

import api from './api';

export const getAdminDashboardStats = async () => {
  const response = await api.get('/v1/dashboard/admin');
  return response.data;
};

export const getReceptionDashboardStats = async () => {
  const response = await api.get('/v1/dashboard/reception');
  return response.data;
};

export const getEmployeeDashboardStats = async () => {
  const response = await api.get('/v1/dashboard/employee');
  return response.data;
};
