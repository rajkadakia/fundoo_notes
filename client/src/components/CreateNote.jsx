import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Form, ButtonGroup } from 'react-bootstrap';
import { Image, CheckSquare, Brush, Bold, Italic, List, ListOrdered } from 'lucide-react';
import { createNote } from '../services/note.service';

const CreateNote = ({ onNoteCreated, initialLabelId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChecklist, setIsChecklist] = useState(false);
  const [note, setNote] = useState({ 
    title: '', 
    items: [],
    labels: initialLabelId ? [initialLabelId] : []
  });
  const [description, setDescription] = useState(''); // Store HTML content
  const [newItemText, setNewItemText] = useState('');
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    unorderedList: false,
    orderedList: false
  });
  
  const containerRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    setNote(prev => ({
      ...prev,
      labels: initialLabelId ? [initialLabelId] : []
    }));
  }, [initialLabelId]);

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

  const handleSubmit = async () => {
    const currentDescription = editorRef.current ? editorRef.current.innerHTML : description;
    
    if (!note.title && !currentDescription && note.items.length === 0) {
        setIsExpanded(false);
        setIsChecklist(false);
        return;
    }
    
    try {
        const payload = { 
            title: note.title,
            items: isChecklist ? note.items : undefined,
            description: isChecklist ? undefined : currentDescription,
            labels: note.labels
        };
        
        await createNote(payload);
        setNote({ 
            title: '', 
            items: [],
            labels: initialLabelId ? [initialLabelId] : []
        });
        setDescription('');
        if (editorRef.current) editorRef.current.innerHTML = '';
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
  }, [isExpanded, note, isChecklist, description]);

  return (
    <div className="d-flex justify-content-center mb-4 pt-3">
      <Card 
        ref={containerRef} 
        className={`shadow-sm border-0 w-100 ${isExpanded ? 'p-1' : ''}`} 
        style={{ maxWidth: '600px', borderRadius: '8px' }}
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
            <Form onKeyDown={(e) => e.key === 'Enter' && !isChecklist && !e.shiftKey && handleSubmit()}>
              <Form.Control
                type="text"
                name="title"
                placeholder="Title"
                className="border-0 shadow-none fs-5 fw-bold mb-2 p-0 bg-transparent"
                value={note.title}
                onChange={handleChange}
              />
              
              {!isChecklist ? (
                <div 
                  ref={editorRef}
                  className="outline-none"
                  contentEditable="true"
                  style={{ outline: 'none', border: 'none', minHeight: '100px', fontSize: '1rem' }}
                  onInput={() => {
                    setDescription(editorRef.current.innerHTML);
                    updateActiveFormats();
                  }}
                  onKeyUp={updateActiveFormats}
                  onClick={updateActiveFormats}
                  data-placeholder="Take a note..."
                ></div>
              ) : (
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
                      className="border-0 shadow-none p-0 bg-transparent"
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      autoFocus
                    />
                  </div>
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="d-flex gap-2 align-items-center text-muted">
                  <CheckSquare 
                    size={18} 
                    className={`cursor-pointer icon-hover ${isChecklist ? 'text-primary' : ''}`}
                    onClick={() => setIsChecklist(!isChecklist)}
                    title="Toggle Checklist"
                  />
                  
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
                  
                  <Image size={18} className="cursor-pointer icon-hover ms-1" title="Add image" />
                </div>
                <Button variant="light" className="text-dark fw-bold px-4 py-1 rounded-1" onClick={handleSubmit}>
                  Close
                </Button>
              </div>
            </Form>
          </Card.Body>
        )}
      </Card>
      {!isExpanded && <style>{`.outline-none:empty:before { content: attr(data-placeholder); color: #6c757d; }`}</style>}
      {isExpanded && <style>{`.outline-none:empty:before { content: attr(data-placeholder); color: #6c757d; }`}</style>}
    </div>
  );
};

export default CreateNote;

