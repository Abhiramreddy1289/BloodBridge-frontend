import api from './api';

const searchDonors = async (filters) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/search?${params}`);
  return response.data;
};

const getHospitals = async (search = '') => {
  const response = await api.get(`/donors/hospitals?search=${search}`);
  return response.data;
};

const updateAvailability = async (payload) => {
  const response = await api.put('/donors/availability', payload);
  return response.data;
};

const updateInventory = async (inventory) => {
  const response = await api.put('/donors/inventory', { inventory });
  return response.data;
};

export default { searchDonors, getHospitals, updateAvailability, updateInventory };
