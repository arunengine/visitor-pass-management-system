/**
 * Frontend Activity Service
 * Purpose: Axios API calls for system audit activity history.
 */

import api from './api';

export const getActivities = async (params = {}) => {
  const response = await api.get('/v1/activities', { params });
  return response.data;
};
