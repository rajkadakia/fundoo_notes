import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { CheckSquare } from 'lucide-react';
import { updateNote } from '../services/note.service';

const EditNoteModal = ({ note, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({ title: '', description: '', items: [] });
  const [isChecklist, setIsChecklist] = useState(false);
  const [newItemText, setNewItemText] = useState('');

  useEffect(() => {
    if (note) {
      setFormData({ 
        title: note.title || '', 
        description: note.description || '', 
        items: note.items || [] 
      });
      setIsChecklist(!!(note.items && note.items.length > 0));
    }
  }, [note]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddItem = () => {
    if (newItemText.trim()) {
      setFormData({
        ...formData,
        items: [...formData.items, { text: newItemText.trim(), isChecked: false }]
      });
      setNewItemText('');
    }
  };

  const removeItem = (index) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const toggleItem = (index) => {
    const newItems = [...formData.items];
    newItems[index].isChecked = !newItems[index].isChecked;
    setFormData({ ...formData, items: newItems });
  };

  const handleSave = async () => {
    try {
      const payload = { ...formData };
      if (!isChecklist) delete payload.items;
      else delete payload.description;

      await updateNote(note._id, payload);
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
          {isChecklist ? (
            <div className="checklist-edit">
              {formData.items.map((item, idx) => (
                <div key={idx} className="d-flex align-items-center mb-2">
                  <Form.Check 
                    type="checkbox" 
                    checked={item.isChecked} 
                    onChange={() => toggleItem(idx)}
                    className="me-2" 
                  />
                  <Form.Control 
                    type="text"
                    className="border-0 shadow-none p-0 bg-transparent flex-grow-1"
                    style={{ textDecoration: item.isChecked ? 'line-through' : 'none', opacity: item.isChecked ? 0.6 : 1 }}
                    value={item.text}
                    onChange={(e) => {
                      const newItems = [...formData.items];
                      newItems[idx].text = e.target.value;
                      setFormData({ ...formData, items: newItems });
                    }}
                  />
                  <Button variant="link" size="sm" className="text-muted p-0 ms-2" onClick={() => removeItem(idx)}>
                    &times;
                  </Button>
                </div>
              ))}
              <div className="d-flex align-items-center mt-3 border-top pt-2">
                <span className="text-muted me-2">+</span>
                <Form.Control 
                  type="text"
                  placeholder="List item"
                  className="border-0 shadow-none p-0 bg-transparent"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem())}
                />
              </div>
            </div>
          ) : (
            <Form.Control
              as="textarea"
              name="description"
              placeholder="Note"
              className="border-0 shadow-none p-0 bg-transparent"
              style={{ resize: 'none', minHeight: '150px' }}
              value={formData.description}
              onChange={handleChange}
            />
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer className="border-0 d-flex justify-content-between p-3" style={{ backgroundColor: note?.color || '#fff' }}>
        <Button 
          variant="link" 
          className="p-0 text-muted" 
          onClick={() => setIsChecklist(!isChecklist)}
          title="Toggle Checklist"
        >
          <CheckSquare size={20} className={isChecklist ? 'text-primary' : ''} />
        </Button>
        <Button variant="light" className="text-dark fw-bold px-4" onClick={handleSave}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditNoteModal;
