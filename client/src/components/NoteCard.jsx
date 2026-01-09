import React from 'react';
import { Card, Button, Badge, Dropdown, Form } from 'react-bootstrap';
import { Pin, Image, Archive, Trash2, RefreshCcw, Tag, X } from 'lucide-react';
import HighlightText from './HighlightText';

const NoteCard = ({ note, allLabels = [], onUpdate, onArchive, onTrash, onRestore, onDeleteForever, onColorChange, onLabelChange, onCreateLabel, onPin, searchQuery, onClick }) => {
  const [labelSearch, setLabelSearch] = React.useState('');
  const [activeDropdown, setActiveDropdown] = React.useState(null); // null, 'color', 'label'

  const colors = [
    { name: 'Default', hex: '#ffffff' },
    { name: 'Important', hex: '#e8f5e9' },
    { name: 'Flag', hex: '#ffebee' },
    { name: 'Archive', hex: '#fffde7' },
    { name: 'Delete', hex: '#5f6368' }
  ];

  const handleLabelToggle = (labelId) => {
    if (!onLabelChange) return;
    const currentLabelIds = note.labels ? note.labels.map(l => (l && l._id) || l).filter(id => id) : [];
    let newLabelIds;
    if (currentLabelIds.includes(labelId)) {
      newLabelIds = currentLabelIds.filter(id => id !== labelId);
    } else {
      newLabelIds = [...currentLabelIds, labelId];
    }
    onLabelChange(note._id, newLabelIds);
  };

  const handleCreateLabelClick = (e) => {
    e.stopPropagation();
    if (onCreateLabel && labelSearch) {
      onCreateLabel(labelSearch);
      setLabelSearch('');
    }
  };

  const getTextColor = (hex) => {
    if (!hex) return 'text-dark';
    const c = hex.toLowerCase();
    if (c === '#5f6368' || c === '#202124') return 'text-white';
    return 'text-dark';
  };

  const textColorClass = getTextColor(note.color);

  const handleDropdownToggle = (menu, isOpen) => {
    if (isOpen) {
      setActiveDropdown(menu);
    } else if (activeDropdown === menu) {
      setActiveDropdown(null);
    }
  };

  return (
    <Card 
      className={`note-card-bootstrap position-relative ${textColorClass}`}
      style={{ 
        backgroundColor: note.color || '#fff', 
        cursor: 'pointer' 
      }}
      onClick={(e) => {
        if (note.isTrash) return;
        if (onClick) onClick();
      }}
    >
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          {note.title && (
            <Card.Title className="fs-6 fw-bold mb-0 flex-grow-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>
              <HighlightText text={note.title} highlight={searchQuery} />
            </Card.Title>
          )}
          <Button 
            variant="link" 
            className={`p-1 rounded-circle border-0 ${textColorClass} ms-auto opacity-hover`}
            onClick={(e) => { e.stopPropagation(); if (onPin) onPin(note._id); }}
            title={note.isPinned ? "Unpin note" : "Pin note"}
          >
            <Pin size={18} fill={note.isPinned ? 'currentColor' : 'none'} />
          </Button>
        </div>

        {note.items && note.items.length > 0 ? (
          <div className="checklist-container mb-2">
            {note.items.map((item, idx) => (
              <div key={idx} className="d-flex align-items-center mb-1">
                <Form.Check 
                  type="checkbox"
                  checked={item.isChecked}
                  onChange={(e) => {
                    e.stopPropagation();
                    const newItems = [...note.items];
                    newItems[idx].isChecked = e.target.checked;
                    onUpdate(note._id, { items: newItems });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="me-2"
                />
                <span style={{ 
                  textDecoration: item.isChecked ? 'line-through' : 'none',
                  opacity: item.isChecked ? 0.6 : 1,
                  fontSize: '0.9rem'
                }}>
                  <HighlightText text={item.text} highlight={searchQuery} />
                </span>
              </div>
            ))}
          </div>
        ) : (
          <Card.Text className="small mb-0" style={{ whiteSpace: 'pre-wrap' }}>
            <HighlightText text={note.description} highlight={searchQuery} isHtml={true} />
          </Card.Text>
        )}

        {note.labels && note.labels.length > 0 && (
          <div className="mt-2 d-flex flex-wrap gap-1">
            {note.labels.map((label) => (
              label && (
                <Badge 
                  key={label._id || label} 
                  pill 
                  bg="light" 
                  text="dark" 
                  className="border-0 px-2 py-1 d-flex align-items-center fw-normal"
                  style={{ fontSize: '0.7rem', backgroundColor: 'rgba(0,0,0,0.05)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="me-1">{label.name || 'Label'}</span>
                  <X 
                    size={10} 
                    className="cursor-pointer" 
                    onClick={(e) => { e.stopPropagation(); handleLabelToggle(label._id || label); }} 
                  />
                </Badge>
              )
            ))}
          </div>
        )}
      </Card.Body>

      <Card.Footer className="bg-transparent border-0 p-1 d-flex justify-content-between align-items-center opacity-hover">
        <div className="d-flex align-items-center">
          {note.isTrash ? (
            <>
              <Button variant="link" size="sm" className={`${textColorClass} p-2`} onClick={(e) => { e.stopPropagation(); onRestore(note._id); }} title="Restore">
                <RefreshCcw size={16} />
              </Button>
              <Button variant="link" size="sm" className={`${textColorClass} p-2`} onClick={(e) => { e.stopPropagation(); onDeleteForever(note._id); }} title="Delete forever">
                <Trash2 size={16} />
              </Button>
            </>
          ) : (
            <>
              <Dropdown 
                className="d-inline" 
                onClick={(e) => e.stopPropagation()}
                show={activeDropdown === 'color'}
                onToggle={(isOpen) => handleDropdownToggle('color', isOpen)}
              >
                <Dropdown.Toggle as={Button} variant="link" size="sm" className={`p-2 border-0 ${textColorClass} no-caret shadow-none`}>
                  <Image size={16} />
                </Dropdown.Toggle>
                <Dropdown.Menu className="p-1 min-w-auto shadow border-0" style={{ borderRadius: '8px' }}>
                  <div className="d-flex flex-wrap gap-1 p-2" style={{ width: '130px' }}>
                    {colors.map((c) => (
                      <div 
                        key={c.name} 
                        className={`rounded-circle border cursor-pointer`} 
                        style={{ backgroundColor: c.hex, width: '25px', height: '25px' }}
                        title={c.name}
                        onClick={(e) => { e.stopPropagation(); onColorChange(note._id, c.hex); setActiveDropdown(null); }}
                      />
                    ))}
                  </div>
                </Dropdown.Menu>
              </Dropdown>

              <Dropdown 
                className="d-inline" 
                onClick={(e) => e.stopPropagation()}
                show={activeDropdown === 'label'}
                onToggle={(isOpen) => handleDropdownToggle('label', isOpen)}
              >
                <Dropdown.Toggle as={Button} variant="link" size="sm" className={`p-2 border-0 ${textColorClass} no-caret shadow-none`}>
                  <Tag size={16} />
                </Dropdown.Toggle>
                <Dropdown.Menu className="p-2 shadow border-0" style={{ minWidth: '200px', borderRadius: '8px' }}>
                  <Form.Control 
                    size="sm" 
                    placeholder="Enter label name" 
                    className="mb-2 shadow-none border-0 border-bottom rounded-0" 
                    value={labelSearch}
                    onChange={(e) => setLabelSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="overflow-auto" style={{ maxHeight: '150px' }}>
                    {(allLabels || []).filter(l => l?.name?.toLowerCase().includes(labelSearch.toLowerCase())).map(label => {
                      const isChecked = note.labels && note.labels.some(nl => (nl._id || nl) === label._id);
                      return (
                        <Form.Check 
                          key={label._id} 
                          type="checkbox" 
                          label={label.name} 
                          checked={isChecked} 
                          onChange={() => handleLabelToggle(label._id)}
                          onClick={(e) => e.stopPropagation()}
                          className="small mx-2 my-1"
                        />
                      );
                    })}
                    {labelSearch && !allLabels.some(l => l.name.toLowerCase() === labelSearch.toLowerCase()) && (
                      <Button variant="link" size="sm" className="p-0 text-decoration-none mx-2 mt-2" onClick={handleCreateLabelClick}>
                        + Create "{labelSearch}"
                      </Button>
                    )}
                  </div>
                </Dropdown.Menu>
              </Dropdown>

              <Button 
                variant="link" 
                size="sm" 
                className={`${textColorClass} p-2`} 
                onClick={(e) => { e.stopPropagation(); onArchive(note._id); }}
                title={note.isArchived ? "Unarchive" : "Archive"}
              >
                {note.isArchived ? <RefreshCcw size={16} /> : <Archive size={16} />}
              </Button>
            </>
          )}
        </div>
        {!note.isTrash && (
           <Button 
            variant="link" 
            size="sm" 
            className={`${textColorClass} p-2`} 
            onClick={(e) => { e.stopPropagation(); onTrash(note._id); }}
            title="Trash"
          >
            <Trash2 size={16} />
          </Button>
        )}
      </Card.Footer>
    </Card>
  );
};

export default NoteCard;
