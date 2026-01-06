import {
  createNoteService,
  getAllNotesService,
  getArchivedNotesService,
  getTrashedNotesService,
  getNotesByLabelService,
  getNoteByIdService,
  updateNoteService,
  deleteNoteService,
  togglePinNoteService
} from '../services/note.service.js';

export const createNote = async (req, res) => {
  try {
    const { title, description, color, isArchived, isTrash, isPinned, labels } = req.body;
    const noteData = {
      title,
      description,
      color,
      isArchived,
      isTrash,
      isPinned,
      labels,
      userId: req.user._id
    };
    const note = await createNoteService(noteData);
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllNotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const notes = await getAllNotesService(req.user._id, page, limit);
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getArchivedNotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const notes = await getArchivedNotesService(req.user._id, page, limit);
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTrashedNotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const notes = await getTrashedNotesService(req.user._id, page, limit);
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNotesByLabel = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const notes = await getNotesByLabelService(req.user._id, req.params.labelId, page, limit);
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNoteById = async (req, res) => {
  try {
    const note = await getNoteByIdService(req.params.id, req.user._id);
    if (note) {
      res.json(note);
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateNote = async (req, res) => {
  try {
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      color: req.body.color,
      isArchived: req.body.isArchived,
      isTrash: req.body.isTrash,
      isPinned: req.body.isPinned,
      labels: req.body.labels
    };

    const updatedNote = await updateNoteService(req.params.id, req.user._id, updateData);
    
    if (updatedNote) {
      res.json(updatedNote);
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const note = await deleteNoteService(req.params.id, req.user._id);
    if (note) {
      res.json({ message: 'Note removed' });
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const togglePinNote = async (req, res) => {
  try {
    const note = await togglePinNoteService(req.params.id, req.user._id);
    if (note) {
      res.json(note);
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
