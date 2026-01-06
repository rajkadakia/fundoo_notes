import express from 'express';
import {
  createLabel,
  getAllLabels,
  getLabelById,
  updateLabel,
  deleteLabel,
} from '../controllers/label.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createLabel);
router.get('/', getAllLabels);
router.get('/:id', getLabelById);
router.put('/:id', updateLabel);
router.delete('/:id', deleteLabel);

export default router;
