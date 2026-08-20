/**
 * Frontend Settings Service
 * Purpose: Axios API calls for application settings (e.g. default meeting duration).
 */

import api from './api';

export const getSettings = async () => {
  const response = await api.get('/v1/settings');
  return response.data;
};

export const updateSettings = async (settingsData) => {
  const response = await api.put('/v1/settings', settingsData);
  return response.data;
};
