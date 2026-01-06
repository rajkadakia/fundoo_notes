import React, { useState, useEffect } from 'react';
import { updateNote } from '../services/note.service';
import './EditNoteModal.css';

const EditNoteModal = ({ note, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({ title: '', description: '' });

  useEffect(() => {
    if (note) {
      setFormData({ title: note.title, description: note.description });
    }
  }, [note]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await updateNote(note._id, formData);
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error("Failed to update note", error);
    }
  };

  if (!note) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <input
          type="text"
          name="title"
          placeholder="Title"
          className="modal-input title-input"
          value={formData.title}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Note"
          className="modal-input body-input"
          value={formData.description}
          onChange={handleChange}
        />
        <div className="modal-footer">
          <button className="modal-btn" onClick={handleSave}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default EditNoteModal;
