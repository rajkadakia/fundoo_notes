import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Button, ButtonGroup } from 'react-bootstrap';
import { CheckSquare, Bold, Italic, List, ListOrdered } from 'lucide-react';
import { updateNote } from '../services/note.service';

const EditNoteModal = ({ note, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({ title: '', items: [] });
  const [description, setDescription] = useState(''); // Store HTML content
  const [isChecklist, setIsChecklist] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    unorderedList: false,
    orderedList: false
  });
  
  const editorRef = useRef(null);

  useEffect(() => {
    if (note) {
      setFormData({ 
        title: note.title || '', 
        items: note.items || [] 
      });
      setDescription(note.description || '');
      setIsChecklist(!!(note.items && note.items.length > 0));
    }
  }, [note]);

  useEffect(() => {
     // Populate editor once modal is open and not in checklist mode
     if (!isChecklist && editorRef.current && description) {
        if (editorRef.current.innerHTML !== description) {
            editorRef.current.innerHTML = description;
        }
     }
  }, [isChecklist, description]);

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

  const updateActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      unorderedList: document.queryCommandState('insertUnorderedList'),
      orderedList: document.queryCommandState('insertOrderedList')
    });
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateActiveFormats();
  };

  const handleSave = async () => {
    const currentDescription = isChecklist ? '' : (editorRef.current ? editorRef.current.innerHTML : description);
    
    // Check if any changes were actually made
    const hasChanges = () => {
      const originalTitle = note.title || '';
      const originalDesc = note.description || '';
      const originalItems = note.items || [];

      if (formData.title !== originalTitle) return true;
      
      if (isChecklist) {
          return JSON.stringify(formData.items) !== JSON.stringify(originalItems);
      } else {
          return currentDescription !== originalDesc;
      }
    };

    if (!hasChanges()) {
      onClose();
      return;
    }

    try {
      const payload = { 
        title: formData.title,
        color: note.color
      };
      
      if (isChecklist) {
          payload.items = formData.items;
      } else {
          payload.description = currentDescription;
      }

      await updateNote(note._id, payload);
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error("Failed to update note", error);
      onClose();
    }
  };

  return (
    <Modal 
      show={!!note} 
      onHide={handleSave} 
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
            <div 
              ref={editorRef}
              className="outline-none"
              contentEditable="true"
              style={{ outline: 'none', border: 'none', minHeight: '150px', fontSize: '1.1rem' }}
              onInput={updateActiveFormats}
              onKeyUp={updateActiveFormats}
              onClick={updateActiveFormats}
              data-placeholder="Note"
            ></div>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer className="border-0 d-flex justify-content-between p-3" style={{ backgroundColor: note?.color || '#fff' }}>
        <div className="d-flex align-items-center gap-2 text-muted">
          <Button 
            variant="link" 
            className="p-0 text-muted icon-hover" 
            onClick={() => setIsChecklist(!isChecklist)}
            title="Toggle Checklist"
          >
            <CheckSquare size={20} className={isChecklist ? 'text-primary' : ''} />
          </Button>

          {!isChecklist && (
            <>
              <div className="vr mx-1" style={{ height: '20px' }}></div>
              <Button 
                variant={activeFormats.bold ? 'warning-subtle' : 'light'} 
                size="sm" 
                className="p-1 border-0 bg-transparent text-muted icon-hover"
                onClick={() => execCommand('bold')}
                title="Bold"
              >
                <Bold size={18} className={activeFormats.bold ? 'text-dark' : ''} />
              </Button>
              <Button 
                variant={activeFormats.italic ? 'warning-subtle' : 'light'} 
                size="sm" 
                className="p-1 border-0 bg-transparent text-muted icon-hover"
                onClick={() => execCommand('italic')}
                title="Italic"
              >
                <Italic size={18} className={activeFormats.italic ? 'text-dark' : ''} />
              </Button>
              <Button 
                variant={activeFormats.unorderedList ? 'warning-subtle' : 'light'} 
                size="sm" 
                className="p-1 border-0 bg-transparent text-muted icon-hover"
                onClick={() => execCommand('insertUnorderedList')}
                title="Bulleted List"
              >
                <List size={18} className={activeFormats.unorderedList ? 'text-dark' : ''} />
              </Button>
              <Button 
                variant={activeFormats.orderedList ? 'warning-subtle' : 'light'} 
                size="sm" 
                className="p-1 border-0 bg-transparent text-muted icon-hover"
                onClick={() => execCommand('insertOrderedList')}
                title="Numbered List"
              >
                <ListOrdered size={18} className={activeFormats.orderedList ? 'text-dark' : ''} />
              </Button>
            </>
          )}
        </div>
        <Button variant="light" className="text-dark fw-bold px-4" onClick={handleSave}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditNoteModal;

