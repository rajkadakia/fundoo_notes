import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Button, Form, ButtonGroup, Dropdown } from 'react-bootstrap';
import { 
    Bold, 
    Italic, 
    List, 
    ListOrdered, 
    Type, 
    Save, 
    ArrowLeft,
    CheckSquare
} from 'lucide-react';
import { createNote } from '../services/note.service';

const CreateNotePage = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isChecklist, setIsChecklist] = useState(false);
    const [items, setItems] = useState([]);
    const [newItemText, setNewItemText] = useState('');
    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        italic: false,
        unorderedList: false,
        orderedList: false,
        h2: false
    });
    const bodyRef = useRef(null);

    const handleAddItem = () => {
        if (newItemText.trim()) {
            setItems([...items, { text: newItemText.trim(), isChecked: false }]);
            setNewItemText('');
        }
    };

    const removeItem = (index) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleSave = async () => {
        if (!title && !bodyRef.current?.innerText && items.length === 0) {
            navigate('/dashboard');
            return;
        }

        try {
            setIsSaving(true);
            const payload = {
                title: title || 'Untitled Note',
            };

            if (isChecklist) {
                payload.items = items;
            } else {
                payload.description = bodyRef.current ? bodyRef.current.innerHTML : '';
            }

            await createNote(payload);
            navigate('/dashboard');
        } catch (error) {
            console.error("Failed to create note", error);
        } finally {
            setIsSaving(false);
        }
    };

    const updateActiveFormats = () => {
        if (!bodyRef.current) return;
        setActiveFormats({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            unorderedList: document.queryCommandState('insertUnorderedList'),
            orderedList: document.queryCommandState('insertOrderedList'),
            h2: document.queryCommandValue('formatBlock') === 'h2'
        });
    };

    const execCommand = (command, value = null) => {
        document.execCommand(command, false, value);
        bodyRef.current?.focus();
        updateActiveFormats();
    };

    return (
        <Container className="py-5" style={{ maxWidth: '800px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Button variant="light" className="d-flex align-items-center gap-2" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </Button>
                <Button 
                    variant="warning" 
                    className="d-flex align-items-center gap-2 px-4 shadow-sm"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : <><Save size={18} /> <span>Save Note</span></>}
                </Button>
            </div>

            <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
                <Card.Header className="bg-white border-bottom py-2">
                    <ButtonGroup className="gap-1">
                        <Button 
                            variant={activeFormats.bold ? 'warning' : 'light'} 
                            size="sm"
                            onClick={() => execCommand('bold')}
                            className="rounded border-0"
                        >
                            <Bold size={18} />
                        </Button>
                        <Button 
                            variant={activeFormats.italic ? 'warning' : 'light'} 
                            size="sm"
                            onClick={() => execCommand('italic')}
                            className="rounded border-0"
                        >
                            <Italic size={18} />
                        </Button>
                        <div className="vr mx-2 my-1"></div>
                        <Button 
                            variant={activeFormats.unorderedList ? 'warning' : 'light'} 
                            size="sm"
                            onClick={() => execCommand('insertUnorderedList')}
                            className="rounded border-0"
                        >
                            <List size={18} />
                        </Button>
                        <Button 
                            variant={activeFormats.orderedList ? 'warning' : 'light'} 
                            size="sm"
                            onClick={() => execCommand('insertOrderedList')}
                            className="rounded border-0"
                        >
                            <ListOrdered size={18} />
                        </Button>
                        <div className="vr mx-2 my-1"></div>
                        <Button 
                            variant={isChecklist ? 'warning' : 'light'} 
                            size="sm"
                            onClick={() => setIsChecklist(!isChecklist)}
                            className="rounded border-0"
                            title="Toggle Checklist"
                        >
                            <CheckSquare size={18} />
                        </Button>
                    </ButtonGroup>
                </Card.Header>

                <Card.Body className="p-4" style={{ minHeight: '500px' }}>
                    <Form.Control 
                        type="text" 
                        className="border-0 shadow-none fs-1 fw-bold mb-4 p-0 bg-transparent" 
                        placeholder="Note Title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ borderBottom: '2px solid transparent' }}
                    />
                    {isChecklist ? (
                        <div className="checklist-page-editor">
                            {items.map((item, idx) => (
                                <div key={idx} className="d-flex align-items-center mb-3 fs-5">
                                    <Form.Check 
                                        type="checkbox" 
                                        checked={item.isChecked} 
                                        onChange={() => {
                                            const newItems = [...items];
                                            newItems[idx].isChecked = !newItems[idx].isChecked;
                                            setItems(newItems);
                                        }}
                                        className="me-3" 
                                    />
                                    <Form.Control 
                                        type="text"
                                        className="border-0 shadow-none p-0 bg-transparent flex-grow-1 fs-5"
                                        style={{ textDecoration: item.isChecked ? 'line-through' : 'none', opacity: item.isChecked ? 0.6 : 1 }}
                                        value={item.text}
                                        onChange={(e) => {
                                            const newItems = [...items];
                                            newItems[idx].text = e.target.value;
                                            setItems(newItems);
                                        }}
                                    />
                                    <Button variant="link" size="sm" className="text-muted p-0 ms-3" onClick={() => removeItem(idx)}>
                                        &times;
                                    </Button>
                                </div>
                            ))}
                            <div className="d-flex align-items-center mt-4 pt-3 border-top">
                                <span className="text-muted me-3 fs-5">+</span>
                                <Form.Control 
                                    type="text"
                                    placeholder="List item"
                                    className="border-0 shadow-none p-0 bg-transparent fs-5"
                                    value={newItemText}
                                    onChange={(e) => setNewItemText(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem())}
                                    autoFocus
                                />
                            </div>
                        </div>
                    ) : (
                        <div 
                            ref={bodyRef}
                            className="notepad-body-editor outline-none fs-5"
                            contentEditable="true"
                            style={{ outline: 'none', border: 'none', minHeight: '400px' }}
                            onInput={() => updateActiveFormats()}
                            onKeyUp={updateActiveFormats}
                            onClick={updateActiveFormats}
                        ></div>
                    )}
                </Card.Body>

                <Card.Footer className="bg-white border-top py-2 px-4 d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                        {isChecklist ? items.length : (bodyRef.current?.innerText.length || 0)} {isChecklist ? 'items' : 'characters'}
                    </small>
                    <small className="text-muted small">
                        Press Ctrl+S to save
                    </small>
                </Card.Footer>
            </Card>
        </Container>
    );
};

export default CreateNotePage;
