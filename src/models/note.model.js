import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: '#ffffff',
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  isTrash: {
    type: Boolean,
    default: false,
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  labels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Label',
  }],
  items: [{
    text: { type: String, required: true },
    isChecked: { type: Boolean, default: false }
  }],
  order: {
    type: Number,
    default: 0
  },
}, {
  timestamps: true,
});

const Note = mongoose.model('Note', noteSchema);
export default Note;
