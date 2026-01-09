import api from './api';

export const getAllNotes = async () => {
  const response = await api.get('/notes');
  return response.data;
};

export const createNote = async (noteData) => {
  const response = await api.post('/notes', noteData);
  return response.data;
};

export const updateNote = async (id, noteData) => {
  const response = await api.put(`/notes/${id}`, noteData);
  return response.data;
};

// Hard delete
export const deleteNoteForever = async (id) => {
  const response = await api.delete(`/notes/${id}`);
  return response.data;
};

export const togglePin = async (id) => {
    const response = await api.put(`/notes/${id}/pin`);
    return response.data;
};

export const archiveNote = async (id) => {
  // Archive is a toggle or set to true. Sending true for now.
  // If we need toggle, we'd need current state or logic.
  // Generally UI knows the state.
  const response = await api.put(`/notes/${id}`, { isArchived: true, isTrash: false });
  return response.data;
};

export const unarchiveNote = async (id) => {
    const response = await api.put(`/notes/${id}`, { isArchived: false });
    return response.data;
};

export const trashNote = async (id) => {
    // Soft delete
    const response = await api.put(`/notes/${id}`, { isTrash: true, isArchived: false });
    return response.data;
};

export const restoreNote = async (id) => {
    const response = await api.put(`/notes/${id}`, { isTrash: false });
    return response.data;
};

export const getArchivedNotes = async () => {
    const response = await api.get('/notes/archived');
    return response.data;
};

export const getTrashedNotes = async () => {
    const response = await api.get('/notes/trash');
    return response.data;
};

export const getNotesByLabel = async (labelId) => {
    const response = await api.get(`/notes/label/${labelId}`);
    return response.data;
};

