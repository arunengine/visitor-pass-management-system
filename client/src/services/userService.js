/**
 * Frontend User Service
 * Purpose: Axios client requests for User Management APIs (GET, POST, PUT, PATCH).
 */

import api from './api';

export const getUsers = async (params = {}) => {
  const response = await api.get('/v1/users', { params });
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/v1/users/${id}`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/v1/users', userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/v1/users/${id}`, userData);
  return response.data;
};

export const toggleUserStatus = async (id, isActive) => {
  const response = await api.patch(`/v1/users/${id}/status`, { isActive });
  return response.data;
};

export const resetUserPassword = async (id, newPassword) => {
  const response = await api.patch(`/v1/users/${id}/reset-password`, { newPassword });
  return response.data;
};

export const resetPassword = resetUserPassword;
