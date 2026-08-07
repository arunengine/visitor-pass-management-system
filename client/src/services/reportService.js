/**
 * Frontend Report Service
 * Purpose: Axios API calls for Report analytics summaries and report visitor logs.
 */

import api from './api';

export const getReportSummary = async (params = {}) => {
  const response = await api.get('/v1/reports/summary', { params });
  return response.data;
};

export const getReportVisitors = async (params = {}) => {
  const response = await api.get('/v1/reports/visitors', { params });
  return response.data;
};
