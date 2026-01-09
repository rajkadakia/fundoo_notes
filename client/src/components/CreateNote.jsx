import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Form, InputGroup } from 'react-bootstrap';
import { Image, CheckSquare, Brush } from 'lucide-react';
import { createNote } from '../services/note.service';

const CreateNote = ({ onNoteCreated }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChecklist, setIsChecklist] = useState(false);
  const [note, setNote] = useState({ title: '', description: '', items: [] });
  const [newItemText, setNewItemText] = useState('');
  const containerRef = useRef(null);

  const handleChange = (e) => {
    setNote({ ...note, [e.target.name]: e.target.value });
  };

  const handleAddItem = () => {
    if (newItemText.trim()) {
      setNote({
        ...note,
        items: [...note.items, { text: newItemText.trim(), isChecked: false }]
      });
      setNewItemText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  const removeItem = (index) => {
    const newItems = [...note.items];
    newItems.splice(index, 1);
    setNote({ ...note, items: newItems });
  };

  const handleSubmit = async () => {
    if (!note.title && !note.description && note.items.length === 0) {
        setIsExpanded(false);
        setIsChecklist(false);
        return;
    }
    
    try {
        const payload = { ...note };
        if (!isChecklist) delete payload.items;
        await createNote(payload);
        setNote({ title: '', description: '', items: [] });
        setIsExpanded(false);
        setIsChecklist(false);
        if (onNoteCreated) onNoteCreated();
    } catch (error) {
        console.error("Failed to create note", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        if (isExpanded) {
            handleSubmit();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, note, isChecklist]);

  return (
    <div className="d-flex justify-content-center mb-4 pt-3">
      <Card 
        ref={containerRef} 
        className={`shadow-sm border-0 w-100 ${isExpanded ? 'p-1' : ''}`} 
        style={{ maxWidth: '600px' }}
      >
        {!isExpanded ? (
          <Card.Body 
            className="d-flex align-items-center justify-content-between cursor-pointer py-2 px-3" 
            onClick={() => setIsExpanded(true)}
          >
            <span className="text-muted">Take a note...</span>
            <div className="d-flex gap-3 text-muted">
              <CheckSquare size={20} className="icon-hover" onClick={(e) => { e.stopPropagation(); setIsExpanded(true); setIsChecklist(true); }} />
              <Brush size={20} className="icon-hover" />
              <Image size={20} className="icon-hover" />
            </div>
          </Card.Body>
        ) : (
          <Card.Body className="p-3">
            <Form onKeyDown={(e) => e.key === 'Enter' && !isChecklist && handleSubmit()}>
              <Form.Control
                type="text"
                name="title"
                placeholder="Title"
                className="border-0 shadow-none fs-5 fw-bold mb-2 p-0"
                value={note.title}
                onChange={handleChange}
              />
              {isChecklist ? (
                <div className="checklist-create">
                  {note.items.map((item, idx) => (
                    <div key={idx} className="d-flex align-items-center mb-1">
                      <Form.Check type="checkbox" disabled className="me-2" />
                      <span className="flex-grow-1">{item.text}</span>
                      <Button variant="link" size="sm" className="text-muted p-0" onClick={() => removeItem(idx)}>
                        &times;
                      </Button>
                    </div>
                  ))}
                  <div className="d-flex align-items-center mt-2 border-top pt-2">
                    <span className="text-muted me-2">+</span>
                    <Form.Control 
                      type="text"
                      placeholder="List item"
                      className="border-0 shadow-none p-0"
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      autoFocus
                    />
                  </div>
                </div>
              ) : (
                <Form.Control
                  as="textarea"
                  name="description"
                  placeholder="Take a note..."
                  className="border-0 shadow-none p-0"
                  style={{ resize: 'none', minHeight: '100px' }}
                  autoFocus
                  value={note.description}
                  onChange={handleChange}
                />
              )}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="d-flex gap-3 text-muted">
                  <CheckSquare 
                    size={18} 
                    className={`cursor-pointer ${isChecklist ? 'text-primary' : ''}`}
                    onClick={() => setIsChecklist(!isChecklist)}
                    title="Toggle Checklist"
                  />
                  {/* Additional footer icons could go here */}
                </div>
                <Button variant="light" className="text-dark fw-bold px-4 py-1" onClick={handleSubmit}>
                  Close
                </Button>
              </div>
            </Form>
          </Card.Body>
        )}
      </Card>
    </div>
  );
};

export default CreateNote;
