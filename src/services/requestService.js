import api from './api';

const createRequest = async (body) => {
  const response = await api.post('/requests', body);
  return response.data;
};

const getRequests = async () => {
  const response = await api.get('/requests');
  return response.data;
};

const getRequestById = async (id) => {
  const response = await api.get(`/requests/${id}`);
  return response.data;
};

const acceptRequest = async (id, eta) => {
  const response = await api.put(`/requests/${id}/accept`, { eta });
  return response.data;
};

const completeRequest = async (id) => {
  const response = await api.put(`/requests/${id}/status`, { status: 'completed' });
  return response.data;
};

const updateRequestStatus = async (id, status) => {
  const response = await api.put(`/requests/${id}/status`, { status });
  return response.data;
};

export default { createRequest, getRequests, getRequestById, acceptRequest, completeRequest, updateRequestStatus };
