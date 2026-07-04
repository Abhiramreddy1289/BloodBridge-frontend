import api from './api';

const getCamps = async () => {
  const response = await api.get('/camps');
  return response.data;
};

const createCamp = async (campData) => {
  const response = await api.post('/camps', campData);
  return response.data;
};

const approveCamp = async (id) => {
  const response = await api.put(`/camps/${id}/approve`);
  return response.data;
};

const getStories = async () => {
  const response = await api.get('/stories');
  return response.data;
};

const createStory = async (quote) => {
  const response = await api.post('/stories', { quote });
  return response.data;
};

export default { getCamps, createCamp, approveCamp, getStories, createStory };
