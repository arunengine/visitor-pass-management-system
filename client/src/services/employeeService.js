/**
 * Frontend Employee Service
 * Purpose: Axios client requests for Employee Management APIs (GET, POST, PUT, PATCH, DELETE).
 */

import api from './api';

export const getEmployees = async (params = {}) => {
  const response = await api.get('/v1/employees', { params });
  return response.data;
};

export const getEmployeeById = async (id) => {
  const response = await api.get(`/v1/employees/${id}`);
  return response.data;
};

export const createEmployee = async (employeeData) => {
  const response = await api.post('/v1/employees', employeeData);
  return response.data;
};

export const updateEmployee = async (id, employeeData) => {
  const response = await api.put(`/v1/employees/${id}`, employeeData);
  return response.data;
};

export const updateEmployeeStatus = async (id, status) => {
  const response = await api.patch(`/v1/employees/${id}/status`, { status });
  return response.data;
};

export const deleteEmployee = async (id) => {
  const response = await api.delete(`/v1/employees/${id}`);
  return response.data;
};
