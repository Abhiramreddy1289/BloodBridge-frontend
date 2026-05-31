import api from './api';

const getUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

const getRequests = async () => {
  const response = await api.get('/admin/requests');
  return response.data;
};

const updateUserStatus = async (userId, isBlocked) => {
  const response = await api.put('/admin/users/status', { userId, isBlocked });
  return response.data;
};

const updateRequestStatus = async (id, status) => {
  const response = await api.put(`/requests/${id}/status`, { status });
  return response.data;
};

const deleteRequest = async (id) => {
  const response = await api.delete(`/admin/fake-request/${id}`);
  return response.data;
};

const getAnalytics = async () => {
  const response = await api.get('/admin/analytics');
  return response.data;
};

const getAllCamps = async () => {
  const response = await api.get('/admin/camps');
  return response.data;
};

export default { getUsers, getRequests, deleteRequest, getAnalytics, updateUserStatus, updateRequestStatus, getAllCamps };
