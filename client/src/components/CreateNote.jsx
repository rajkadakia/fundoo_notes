import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Form, InputGroup } from 'react-bootstrap';
import { Image, CheckSquare, Brush } from 'lucide-react';
import { createNote } from '../services/note.service';

const CreateNote = ({ onNoteCreated }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [note, setNote] = useState({ title: '', description: '' });
  const containerRef = useRef(null);

  const handleChange = (e) => {
    setNote({ ...note, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!note.title && !note.description) {
        setIsExpanded(false);
        return;
    }
    
    try {
        await createNote(note);
        setNote({ title: '', description: '' });
        setIsExpanded(false);
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
  }, [isExpanded, note]);

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
              <CheckSquare size={20} />
              <Brush size={20} />
              <Image size={20} />
            </div>
          </Card.Body>
        ) : (
          <Card.Body className="p-3">
            <Form>
              <Form.Control
                type="text"
                name="title"
                placeholder="Title"
                className="border-0 shadow-none fs-5 fw-bold mb-2 p-0"
                value={note.title}
                onChange={handleChange}
              />
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
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="d-flex gap-3 text-muted">
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
