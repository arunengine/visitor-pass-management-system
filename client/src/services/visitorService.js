/**
 * Frontend Visitor Service
 * Purpose: Axios client requests for Visitor Registration APIs (GET, POST, PUT, PATCH).
 */

import api from './api';

export const getVisitors = async (params = {}) => {
  const response = await api.get('/v1/visitors', { params });
  return response.data;
};

export const getVisitorById = async (id) => {
  const response = await api.get(`/v1/visitors/${id}`);
  return response.data;
};

export const createVisitor = async (visitorData) => {
  const response = await api.post('/v1/visitors', visitorData);
  return response.data;
};

export const updateVisitor = async (id, visitorData) => {
  const response = await api.put(`/v1/visitors/${id}`, visitorData);
  return response.data;
};

export const cancelVisitor = async (id) => {
  const response = await api.patch(`/v1/visitors/${id}/cancel`);
  return response.data;
};

export const getMyPendingVisitors = async (params = {}) => {
  const response = await api.get('/v1/visitors/my-pending', { params });
  return response.data;
};

export const getMyApprovedVisitors = async (params = {}) => {
  const response = await api.get('/v1/visitors/my-approved', { params });
  return response.data;
};

export const getMyRejectedVisitors = async (params = {}) => {
  const response = await api.get('/v1/visitors/my-rejected', { params });
  return response.data;
};

export const approveVisitor = async (id, remarks = '') => {
  const response = await api.patch(`/v1/visitors/${id}/approve`, { remarks });
  return response.data;
};

export const rejectVisitor = async (id, remarks = '') => {
  const response = await api.patch(`/v1/visitors/${id}/reject`, { remarks });
  return response.data;
};

export const getActiveVisitorsInside = async (params = {}) => {
  const response = await api.get('/v1/visitors/active-inside', { params });
  return response.data;
};

export const getTodayCheckIns = async (params = {}) => {
  const response = await api.get('/v1/visitors/today-checkins', { params });
  return response.data;
};

export const getTodayCheckOuts = async (params = {}) => {
  const response = await api.get('/v1/visitors/today-checkouts', { params });
  return response.data;
};

export const checkInVisitor = async (id) => {
  const response = await api.patch(`/v1/visitors/${id}/check-in`);
  return response.data;
};

export const checkOutVisitor = async (id) => {
  const response = await api.patch(`/v1/visitors/${id}/check-out`);
  return response.data;
};

export const getUnallocatedVisitors = async (params = {}) => {
  const response = await api.get('/v1/visitors/unallocated', { params });
  return response.data;
};

export const allocateVisitor = async (id, employeeId) => {
  const response = await api.patch(`/v1/visitors/${id}/allocate`, { employeeId });
  return response.data;
};

export const allocateDynamic = async () => {
  const response = await api.post('/v1/visitors/allocate-dynamic');
  return response.data;
};
