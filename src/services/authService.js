import api from './api';

const registerUser = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

const updateAvatar = async (image) => {
  const response = await api.put('/auth/avatar', { image });
  return response.data;
};

export default { registerUser, loginUser, getMe, updateAvatar };
