import express from 'express';
import {
  createNote,
  getAllNotes,
  getArchivedNotes,
  getTrashedNotes,
  getNotesByLabel,
  getNoteById,
  updateNote,
  deleteNote,
  togglePinNote,
} from '../controllers/note.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createNote);
router.get('/', getAllNotes);
router.get('/archived', getArchivedNotes);
router.get('/trash', getTrashedNotes);
router.get('/label/:labelId', getNotesByLabel);
router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.put('/:id/pin', togglePinNote);
router.delete('/:id', deleteNote);

export default router;

