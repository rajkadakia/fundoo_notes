import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { updateNote } from '../services/note.service';

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

  return (
    <Modal 
      show={!!note} 
      onHide={onClose} 
      centered 
      contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
    >
      <Modal.Body className="p-4" style={{ backgroundColor: note?.color || '#fff' }}>
        <Form>
          <Form.Control
            type="text"
            name="title"
            placeholder="Title"
            className="border-0 shadow-none fs-4 fw-bold mb-3 p-0 bg-transparent"
            value={formData.title}
            onChange={handleChange}
          />
          <Form.Control
            as="textarea"
            name="description"
            placeholder="Note"
            className="border-0 shadow-none p-0 bg-transparent"
            style={{ resize: 'none', minHeight: '150px' }}
            value={formData.description}
            onChange={handleChange}
          />
        </Form>
      </Modal.Body>
      <Modal.Footer className="border-0 d-flex justify-content-end p-3" style={{ backgroundColor: note?.color || '#fff' }}>
        <Button variant="light" className="text-dark fw-bold px-4" onClick={handleSave}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditNoteModal;
