import React, { useState } from 'react';
import { X, Check, Edit2, Trash2, Tag, Plus } from 'lucide-react';
import { useLabels } from '../context/LabelContext';
import './EditLabelsModal.css';

const EditLabelsModal = ({ onClose }) => {
    const { labels, addLabel, updateLabel, deleteLabel } = useLabels();
    const [newLabelName, setNewLabelName] = useState('');
    const [editingLabelId, setEditingLabelId] = useState(null);
    const [editName, setEditName] = useState('');

    const handleCreate = async () => {
        if (!newLabelName.trim()) return;
        try {
            await addLabel(newLabelName);
            setNewLabelName('');
        } catch (error) {
            console.error("Error creating label", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteLabel(id);
        } catch (error) {
            console.error("Error deleting label", error);
        }
    };

    const startEdit = (label) => {
        setEditingLabelId(label._id);
        setEditName(label.name);
    };

    const handleUpdate = async () => {
        if (!editName.trim()) return;
        try {
            await updateLabel(editingLabelId, editName);
            setEditingLabelId(null);
            setEditName('');
        } catch (error) {
            console.error("Error updating label", error);
        }
    };

    return (
        <div className="edit-labels-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
                <h3>Edit labels</h3>
            </div>
            
            <div className="modal-content">
                {/* Create New */}
                <div className="label-row create-row">
                    <button 
                        className="icon-btn-small" 
                        onClick={() => {
                            if (newLabelName) {
                                setNewLabelName(''); // Clear if has text
                            } else {
                                // Focus input if empty (optional, just prevent confusion)
                                document.querySelector('.create-label-input')?.focus();
                            }
                        }}
                    >
                         {newLabelName ? <X size={18} /> : <Plus size={18} />}
                    </button>
                    <input 
                        className="create-label-input"
                        type="text" 
                        placeholder="Create new label" 
                        value={newLabelName}
                        onChange={(e) => setNewLabelName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    />
                    <button className="icon-btn-small check-btn" onClick={handleCreate} title="Create label">
                        <Check size={18} />
                    </button>
                </div>

                {/* List */}
                <div className="labels-list-scroll">
                    {labels.map(label => (
                        <div key={label._id} className="label-row">
                            {editingLabelId === label._id ? (
                                <>
                                    <button className="icon-btn-small" onClick={() => deleteLabel(label._id)}>
                                        <Trash2 size={18} />
                                    </button>
                                    <input 
                                        type="text" 
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                                        autoFocus
                                    />
                                    <button className="icon-btn-small check-btn" onClick={handleUpdate}>
                                        <Check size={18} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="label-icon-wrapper" onClick={() => handleDelete(label._id)} title="Delete label">
                                         {/* Using Trash on left as Delete per user request 'make delete or edit labels from there' - keeps consistency with edit mode */}
                                         {/* Actually Google Keep uses Label icon on left, pencil on right. Clicking pencil enters edit mode. */}
                                         <Tag size={18} /> 
                                    </div>
                                    <span className="label-text" onClick={() => startEdit(label)}>{label.name}</span>
                                    <button className="icon-btn-small" onClick={() => startEdit(label)}>
                                        <Edit2 size={18} />
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="modal-footer">
                <button className="done-btn" onClick={onClose}>Done</button>
            </div>
        </div>
    );
};

export default EditLabelsModal;
