import api from './api';

export const getAllLabels = async () => {
  const response = await api.get('/labels');
  return response.data;
};

export const createLabel = async (name) => {
  const response = await api.post('/labels', { name });
  return response.data;
};

export const deleteLabel = async (id) => {
    const response = await api.delete(`/labels/${id}`);
    return response.data;
};

export const updateLabel = async (id, name) => {
    const response = await api.put(`/labels/${id}`, { name });
    return response.data;
};
