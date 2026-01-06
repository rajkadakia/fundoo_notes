import React, { useState, useRef, useEffect } from 'react';
import { Image, CheckSquare, Brush, Check } from 'lucide-react';
import Input from './Input';
import { createNote } from '../services/note.service';
import './CreateNote.css';

const CreateNote = ({ onNoteCreated }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [note, setNote] = useState({ title: '', description: '' });
  const containerRef = useRef(null);

  const handleChange = (e) => {
    setNote({ ...note, [e.target.name]: e.target.value });
  };

  const handleCollapse = () => {
      // If content exists, create note? Or just collapse.
      // Usually "Close" button submits.
      setIsExpanded(false);
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

  // Click outside to collapse/submit
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
    <div className="create-note-wrapper">
        <div className={`create-note-container ${isExpanded ? 'expanded' : ''}`} ref={containerRef}>
        {!isExpanded ? (
            <div className="create-note-collapsed" onClick={() => setIsExpanded(true)}>
            <span className="placeholder-text">Take a note...</span>
            <div className="collapsed-actions">
                <CheckSquare size={20} />
                <Brush size={20} />
                <Image size={20} />
            </div>
            </div>
        ) : (
            <div className="create-note-expanded">
            <input 
                type="text" 
                name="title" 
                placeholder="Title" 
                className="note-input title-input" 
                value={note.title}
                onChange={handleChange}
            />
            <textarea 
                name="description" 
                placeholder="Take a note..." 
                className="note-input body-input" 
                autoFocus
                value={note.description}
                onChange={handleChange}
            />
            <div className="create-note-footer">
                <div className="footer-actions">
                    {/* Icons similar to NoteCard */}
                </div>
                <button className="close-btn" onClick={handleSubmit}>Close</button>
            </div>
            </div>
        )}
        </div>
    </div>
  );
};

export default CreateNote;
