import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Form, Dropdown } from 'react-bootstrap';
import { Image, CheckSquare, Brush, Bold, Italic, List, ListOrdered, Pin, Palette, Bell, UserPlus, Archive, MoreVertical, Undo2, Redo2, Baseline } from 'lucide-react';
import { createNote } from '../services/note.service';

const CreateNote = ({ onNoteCreated, initialLabelId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChecklist, setIsChecklist] = useState(false);
  const [note, setNote] = useState({ 
    title: '', 
    items: [],
    labels: initialLabelId ? [initialLabelId] : [],
    color: '#ffffff',
    isPinned: false
  });
  const [description, setDescription] = useState(''); // Store HTML content
  const [newItemText, setNewItemText] = useState('');
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    unorderedList: false,
    orderedList: false
  });

  const colors = [
    { name: 'Default', hex: '#ffffff' },
    { name: 'Red', hex: '#f28b82' },
    { name: 'Orange', hex: '#fbbc04' },
    { name: 'Yellow', hex: '#fff475' },
    { name: 'Green', hex: '#ccff90' },
    { name: 'Teal', hex: '#a7ffeb' },
    { name: 'Blue', hex: '#cbf0f8' },
    { name: 'Dark Blue', hex: '#aecbfa' },
    { name: 'Purple', hex: '#d7aefb' },
    { name: 'Pink', hex: '#fdcfe8' },
    { name: 'Brown', hex: '#e6c9a8' },
    { name: 'Gray', hex: '#e8eaed' }
  ];
  
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

  const execCommand = (e, command, value = null) => {
    e.preventDefault(); // Prevent focus loss from editor
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateActiveFormats();
  };

  const handleSubmit = async (isArchived = false) => {
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
            labels: note.labels,
            color: note.color,
            isPinned: note.isPinned,
            isArchived: isArchived
        };
        
        await createNote(payload);
        setNote({ 
            title: '', 
            items: [],
            labels: initialLabelId ? [initialLabelId] : [],
            color: '#ffffff',
            isPinned: false
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

  const handleArchive = () => {
    handleSubmit(true);
  };

  const handleColorChange = (colorHex) => {
    setNote({ ...note, color: colorHex });
  };

  const togglePin = () => {
    setNote({ ...note, isPinned: !note.isPinned });
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
        className={`shadow-sm border border-light-subtle w-100 ${isExpanded ? 'p-1' : ''}`} 
        style={{ 
            maxWidth: '600px', 
            borderRadius: '8px', 
            backgroundColor: note.color,
            transition: 'background-color 0.2s ease-in-out',
            boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 2px 6px 2px rgba(60,64,67,0.15)'
        }}
      >
        {!isExpanded ? (
          <Card.Body 
            className="d-flex align-items-center justify-content-between cursor-pointer py-2 px-3" 
            onClick={() => setIsExpanded(true)}
          >
            <span className="text-muted fs-6 fw-medium" style={{ opacity: 0.8 }}>Take a note...</span>
            <div className="d-flex gap-3 text-muted">
              <CheckSquare size={22} className="icon-hover" onClick={(e) => { e.stopPropagation(); setIsExpanded(true); setIsChecklist(true); }} title="New list" />
              <Brush size={22} className="icon-hover" title="New note with drawing" />
              <Image size={22} className="icon-hover" title="New note with image" />
            </div>
          </Card.Body>
        ) : (
          <Card.Body className="p-3">
            <Form onKeyDown={(e) => e.key === 'Enter' && !isChecklist && !e.shiftKey && handleSubmit()}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <Form.Control
                  type="text"
                  name="title"
                  placeholder="Title"
                  className="border-0 shadow-none fs-5 fw-bold p-0 bg-transparent flex-grow-1"
                  value={note.title}
                  onChange={handleChange}
                  style={{ color: 'inherit' }}
                />
                <Button 
                    variant="link" 
                    className="p-1 rounded-circle border-0 text-muted icon-hover"
                    onClick={togglePin}
                    title={note.isPinned ? "Unpin note" : "Pin note"}
                >
                    <Pin size={24} fill={note.isPinned ? 'currentColor' : 'none'} />
                </Button>
              </div>
              
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
                  <Dropdown className="d-inline">
                    <Dropdown.Toggle as="div" className="icon-hover p-0 border-0 bg-transparent no-caret shadow-none cursor-pointer">
                      <Baseline size={20} title="Formatting options" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="p-1 min-w-auto shadow border border-light-subtle" style={{ borderRadius: '8px' }}>
                      <div className="d-flex gap-1 p-1">
                        <Button 
                          variant={activeFormats.bold ? 'warning-subtle' : 'light'} 
                          size="sm" 
                          className="p-1 border-0 bg-transparent text-muted icon-hover"
                          onMouseDown={(e) => execCommand(e, 'bold')}
                          title="Bold"
                        >
                          <Bold size={18} className={activeFormats.bold ? 'text-dark' : ''} />
                        </Button>
                        <Button 
                          variant={activeFormats.italic ? 'warning-subtle' : 'light'} 
                          size="sm" 
                          className="p-1 border-0 bg-transparent text-muted icon-hover"
                          onMouseDown={(e) => execCommand(e, 'italic')}
                          title="Italic"
                        >
                          <Italic size={18} className={activeFormats.italic ? 'text-dark' : ''} />
                        </Button>
                        <Button 
                          variant={activeFormats.unorderedList ? 'warning-subtle' : 'light'} 
                          size="sm" 
                          className="p-1 border-0 bg-transparent text-muted icon-hover"
                          onMouseDown={(e) => execCommand(e, 'insertUnorderedList')}
                          title="Bulleted List"
                        >
                          <List size={18} className={activeFormats.unorderedList ? 'text-dark' : ''} />
                        </Button>
                        <Button 
                          variant={activeFormats.orderedList ? 'warning-subtle' : 'light'} 
                          size="sm" 
                          className="p-1 border-0 bg-transparent text-muted icon-hover"
                          onMouseDown={(e) => execCommand(e, 'insertOrderedList')}
                          title="Numbered List"
                        >
                          <ListOrdered size={18} className={activeFormats.orderedList ? 'text-dark' : ''} />
                        </Button>
                      </div>
                    </Dropdown.Menu>
                  </Dropdown>
                  
                  <Dropdown className="d-inline">
                    <Dropdown.Toggle as="div" className="icon-hover p-0 border-0 bg-transparent no-caret shadow-none cursor-pointer">
                      <Palette size={20} title="Change color" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="p-1 min-w-auto shadow border border-light-subtle" style={{ borderRadius: '8px' }}>
                      <div className="d-flex flex-wrap gap-1 p-2" style={{ width: '130px' }}>
                        {colors.map((c) => (
                          <div 
                            key={c.name} 
                            className={`rounded-circle border cursor-pointer ${note.color === c.hex ? 'border-primary border-2' : ''}`} 
                            style={{ backgroundColor: c.hex, width: '25px', height: '25px' }}
                            title={c.name}
                            onClick={() => handleColorChange(c.hex)}
                          />
                        ))}
                      </div>
                    </Dropdown.Menu>
                  </Dropdown>

                  <Bell size={20} className="cursor-pointer icon-hover" title="Remind me" />
                  <UserPlus size={20} className="cursor-pointer icon-hover" title="Collaborator" />
                  <Image size={20} className="cursor-pointer icon-hover" title="Add image" />
                  <Archive size={20} className="cursor-pointer icon-hover" title="Archive" onClick={handleArchive} />
                  <MoreVertical size={20} className="cursor-pointer icon-hover" title="More" />
                  <Undo2 size={20} className="cursor-pointer icon-hover" title="Undo" />
                  <Redo2 size={20} className="cursor-pointer icon-hover" title="Redo" />
                </div>
                <Button variant="link" className="text-dark text-decoration-none fw-bold px-3 py-1 rounded-1 hover-bg-light" onClick={() => handleSubmit()}>
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

