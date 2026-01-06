import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Bold, 
    Italic, 
    List, 
    ListOrdered, 
    Type, 
    Save, 
    ArrowLeft,
    Check
} from 'lucide-react';
import { createNote } from '../services/note.service';
import './CreateNotePage.css';

const CreateNotePage = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
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
        <div className="notepad-page-container">
            <div className="notepad-header-nav">
                <button className="back-btn" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>
                <button 
                    className={`save-btn ${isSaving ? 'saving' : ''}`} 
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : <><Save size={18} /> Save Note</>}
                </button>
            </div>

            <div className="notepad-paper">
                <div className="notepad-toolbar">
                    <button 
                        type="button" 
                        className={activeFormats.bold ? 'active' : ''}
                        onClick={() => execCommand('bold')} 
                        title="Bold"
                    >
                        <Bold size={18} />
                    </button>
                    <button 
                        type="button" 
                        className={activeFormats.italic ? 'active' : ''}
                        onClick={() => execCommand('italic')} 
                        title="Italic"
                    >
                        <Italic size={18} />
                    </button>
                    <div className="toolbar-divider"></div>
                    <button 
                        type="button" 
                        className={activeFormats.unorderedList ? 'active' : ''}
                        onClick={() => execCommand('insertUnorderedList')} 
                        title="Bullet List"
                    >
                        <List size={18} />
                    </button>
                    <button 
                        type="button" 
                        className={activeFormats.orderedList ? 'active' : ''}
                        onClick={() => execCommand('insertOrderedList')} 
                        title="Numbered List"
                    >
                        <ListOrdered size={18} />
                    </button>
                    <div className="toolbar-divider"></div>
                    <button 
                        type="button" 
                        className={activeFormats.h2 ? 'active' : ''}
                        onClick={() => execCommand('formatBlock', activeFormats.h2 ? 'div' : 'h2')} 
                        title="Heading"
                    >
                        <Type size={18} />
                    </button>
                </div>

                <div className="notepad-content">
                    <input 
                        type="text" 
                        className="notepad-title-input" 
                        placeholder="Note Title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <div className="notepad-body-wrapper">
                        <div 
                            ref={bodyRef}
                            className="notepad-body-editor"
                            contentEditable="true"
                            placeholder="Start writing your note here..."
                            onInput={(e) => {
                                setDescription(e.currentTarget.innerHTML);
                                updateActiveFormats();
                            }}
                            onKeyUp={updateActiveFormats}
                            onClick={updateActiveFormats}
                        ></div>
                    </div>
                </div>
            </div>
            
            <div className="notepad-footer">
                <span className="char-count">{bodyRef.current?.innerText.length || 0} characters</span>
            </div>
        </div>
    );
};

export default CreateNotePage;
