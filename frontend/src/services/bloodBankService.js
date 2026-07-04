import api from './api';

const getBloodBanks = async (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value);
    }
  });

  const response = await api.get(`/blood-banks?${params.toString()}`);
  return response.data;
};

const getNearbyBloodBanks = async ({ latitude, longitude, radius, bloodGroup, limit = 50 }) => {
  const params = new URLSearchParams({
    latitude,
    longitude,
    radius,
    limit,
  });

  if (bloodGroup) params.set('bloodGroup', bloodGroup);

  const response = await api.get(`/blood-banks/nearby?${params.toString()}`);
  return response.data;
};

const getFilters = async (state) => {
  const params = new URLSearchParams();
  if (state) params.set('state', state);

  const response = await api.get(`/blood-banks/filters?${params.toString()}`);
  return response.data;
};

export default { getBloodBanks, getNearbyBloodBanks, getFilters };
