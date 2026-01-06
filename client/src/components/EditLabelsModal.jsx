import React, { useState } from 'react';
import { Modal, Button, Form, ListGroup, InputGroup } from 'react-bootstrap';
import { X, Check, Edit2, Trash2, Tag, Plus } from 'lucide-react';
import { useLabels } from '../context/LabelContext';

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
        <Modal show={true} onHide={onClose} centered size="sm">
            <Modal.Header closeButton className="border-0">
                <Modal.Title className="fs-5 fw-bold">Edit labels</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-0">
                {/* Create New */}
                <div className="mb-3">
                    <InputGroup size="sm" className="border-bottom border-warning">
                        <Button 
                            variant="link" 
                            className="text-muted p-1" 
                            onClick={() => setNewLabelName('')}
                        >
                            {newLabelName ? <X size={18} /> : <Plus size={18} />}
                        </Button>
                        <Form.Control
                            className="border-0 shadow-none bg-transparent"
                            placeholder="Create new label"
                            value={newLabelName}
                            onChange={(e) => setNewLabelName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        />
                        <Button 
                            variant="link" 
                            className="text-muted p-1" 
                            onClick={handleCreate}
                            disabled={!newLabelName.trim()}
                        >
                            <Check size={18} />
                        </Button>
                    </InputGroup>
                </div>

                {/* List */}
                <div className="overflow-auto" style={{ maxHeight: '300px' }}>
                    {labels.map(label => (
                        <div key={label._id} className="d-flex align-items-center mb-1 py-1">
                            {editingLabelId === label._id ? (
                                <InputGroup size="sm" className="w-100 border-bottom border-warning">
                                    <Button 
                                        variant="link" 
                                        className="text-muted p-1" 
                                        onClick={() => deleteLabel(label._id)}
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                    <Form.Control 
                                        className="border-0 shadow-none bg-transparent"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                                        autoFocus
                                    />
                                    <Button 
                                        variant="link" 
                                        className="text-muted p-1" 
                                        onClick={handleUpdate}
                                    >
                                        <Check size={18} />
                                    </Button>
                                </InputGroup>
                            ) : (
                                <>
                                    <div className="text-muted p-1 me-2">
                                         <Tag size={18} /> 
                                    </div>
                                    <span 
                                        className="flex-grow-1 cursor-pointer" 
                                        onClick={() => startEdit(label)}
                                    >
                                        {label.name}
                                    </span>
                                    <Button 
                                        variant="link" 
                                        className="text-muted p-1 opacity-0 hover-opacity-100" 
                                        onClick={() => startEdit(label)}
                                    >
                                        <Edit2 size={18} />
                                    </Button>
                                    <Button 
                                        variant="link" 
                                        className="text-muted p-1 opacity-0 hover-opacity-100" 
                                        onClick={() => deleteLabel(label._id)}
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </Modal.Body>
            <Modal.Footer className="border-0">
                <Button variant="link" className="text-dark fw-bold text-decoration-none" onClick={onClose}>
                    Done
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditLabelsModal;
