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
    ArrowLeft
} from 'lucide-react';
import { createNote } from '../services/note.service';

const CreateNotePage = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        italic: false,
        unorderedList: false,
        orderedList: false,
        h2: false
    });
    const bodyRef = useRef(null);

    const updateActiveFormats = () => {
        setActiveFormats({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            unorderedList: document.queryCommandState('insertUnorderedList'),
            orderedList: document.queryCommandState('insertOrderedList'),
            h2: document.queryCommandValue('formatBlock') === 'h2'
        });
    };

    const handleSave = async () => {
        if (!title && !bodyRef.current?.innerText) {
            navigate('/dashboard');
            return;
        }

        try {
            setIsSaving(true);
            const content = bodyRef.current ? bodyRef.current.innerHTML : '';
            await createNote({ 
                title: title || 'Untitled Note', 
                description: content 
            });
            navigate('/dashboard');
        } catch (error) {
            console.error("Failed to create note", error);
        } finally {
            setIsSaving(false);
        }
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
                            variant={activeFormats.h2 ? 'warning' : 'light'} 
                            size="sm"
                            onClick={() => execCommand('formatBlock', activeFormats.h2 ? 'div' : 'h2')}
                            className="rounded border-0"
                        >
                            <Type size={18} />
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
                    <div 
                        ref={bodyRef}
                        className="notepad-body-editor outline-none fs-5"
                        contentEditable="true"
                        style={{ outline: 'none', border: 'none', minHeight: '400px' }}
                        onInput={() => updateActiveFormats()}
                        onKeyUp={updateActiveFormats}
                        onClick={updateActiveFormats}
                    ></div>
                </Card.Body>

                <Card.Footer className="bg-white border-top py-2 px-4 d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                        {bodyRef.current?.innerText.length || 0} characters
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
