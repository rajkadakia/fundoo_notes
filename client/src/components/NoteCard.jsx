import React from 'react';
import { Pin, Bell, UserPlus, Image, Archive, MoreVertical, Trash2, RefreshCcw, XOctagon, Tag, X, ChevronRight, ChevronLeft } from 'lucide-react';
import HighlightText from './HighlightText';
import './NoteCard.css';

const NoteCard = ({ note, allLabels = [], onUpdate, onArchive, onTrash, onRestore, onDeleteForever, onColorChange, onLabelChange, onCreateLabel, onPin, searchQuery, onClick }) => {
  const [showPalette, setShowPalette] = React.useState(false);
  const [showLabelSelector, setShowLabelSelector] = React.useState(false);
  const [showMenu, setShowMenu] = React.useState(false);
  const [labelSearch, setLabelSearch] = React.useState('');

  // Aesthetic Pastel Colors (Material Design 50) - Mapped to Categories
  const colors = [
    { name: 'Default', hex: '#ffffff' },
    { name: 'Important', hex: '#e8f5e9' }, // Green
    { name: 'Flag', hex: '#ffebee' }, // Red
    { name: 'Archive', hex: '#fffde7' }, // Yellow
    { name: 'Delete', hex: '#5f6368' }  // Grey
  ];

  const handleArchiveClick = (e) => {
      e.stopPropagation();
      onArchive(note._id);
  };
    
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

  const handleTrashClick = (e) => {
      e.stopPropagation();
      onTrash(note._id);
  };

  const handleRestoreClick = (e) => {
      e.stopPropagation();
      onRestore(note._id);
  };

  const handleDeleteForeverClick = (e) => {
      e.stopPropagation();
      onDeleteForever(note._id);
  };

  const getTextColor = (hex) => {
      if (!hex) return '#202124';
      const c = hex.toLowerCase();
      // Only Grey (#5f6368) needs white text.
      if (c === '#5f6368' || c === '#202124') return '#ffffff';
      return '#202124';
  };

  const textColor = getTextColor(note.color);

  return (
    <div 
        className={`note-card`} 
        style={{ backgroundColor: note.color || '#fff', color: textColor }}
        onClick={note.isTrash ? undefined : onClick}
        onMouseLeave={() => setShowPalette(false)}
    >
      {/* Overlays */}
      {note.isTrash && <div className="note-overlay overlay-trash"></div>}
      {note.isArchived && !note.isTrash && <div className="note-overlay overlay-archive"></div>}

      <div className="note-content">
        <div className="note-header">
            <h3 className="note-title" style={{color: textColor}}>
                <HighlightText text={note.title} highlight={searchQuery} />
            </h3>
            <div className="note-pin-action" onClick={(e) => { e.stopPropagation(); if (onPin) onPin(note._id); }}>
                 <Pin 
                    size={18} 
                    className={`pin-icon ${note.isPinned ? 'pinned' : ''}`} 
                    style={{
                        color: textColor, 
                        fill: note.isPinned ? textColor : 'none',
                        cursor: 'pointer'
                    }} 
                />
            </div>
        </div>
        <div className="note-body" style={{color: textColor}}>
            <HighlightText text={note.description} highlight={searchQuery} isHtml={true} />
        </div>
        
        {/* Labels */}
        {note.labels && note.labels.length > 0 && (
            <div className="note-labels">
                {note.labels.map((label) => (
                    label && (
                    <span key={label._id || label} className="label-chip" onClick={(e) => e.stopPropagation()}>
                        <span className="label-text">{label.name ? label.name : 'Label'}</span>
                        <X size={14} className="label-remove-icon" onClick={() => handleLabelToggle(label._id || label)} />
                    </span>
                    )
                ))}
            </div>
        )}
      </div>
      
      <div className="note-actions" onClick={(e) => e.stopPropagation()}>
        {note.isTrash ? (
            <>
                <button className="action-btn" title="Restore" onClick={handleRestoreClick} style={{color: textColor}}>
                    <RefreshCcw size={18} />
                </button>
                <button className="action-btn" title="Delete Forever" onClick={handleDeleteForeverClick} style={{color: textColor}}>
                    <Trash2 size={18} />
                </button>
            </>
        ) : (
            <div className="note-actions-container" style={{position: 'relative', width: '100%', display: 'flex', alignItems: 'center'}}>
                 {/* Expand/Collapse Arrow */}
                <button 
                    className="action-btn expand-btn" 
                    title={showMenu ? "Collapse" : "Expand actions"} 
                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); setShowPalette(false); setShowLabelSelector(false); }}
                    style={{color: textColor}}
                >
                    {showMenu ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>

                {/* Horizontal Actions Row (Hidden by default) */}
                {showMenu && (
                    <div className="expanded-actions-row" onClick={(e) => e.stopPropagation()}>
                        
                        <button className="action-btn" title="Remind me" style={{color: textColor}}>
                            <Bell size={18} />
                        </button>
                        <button className="action-btn" title="Collaborator" style={{color: textColor}}>
                            <UserPlus size={18} />
                        </button>

                         <div style={{position: 'relative'}}>
                            <button 
                                className="action-btn" 
                                title="Change Color" 
                                onClick={(e) => { e.stopPropagation(); setShowPalette(!showPalette); setShowLabelSelector(false); }}
                                style={{color: textColor}}
                            >
                                <Image size={18} />
                            </button>
                            {showPalette && (
                                <div className="color-palette-popup category-list" onClick={(e) => e.stopPropagation()}>
                                    {colors.map((c) => (
                                        <div 
                                            key={c.name} 
                                            className="category-option" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onColorChange(note._id, c.hex);
                                                setShowPalette(false);
                                            }}
                                        >
                                            <span className="category-dot" style={{backgroundColor: c.hex, border: c.hex === '#ffffff' ? '1px solid #ddd' : 'none'}}></span>
                                            <span className="category-name">{c.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{position: 'relative'}}>
                            <button 
                                className="action-btn" 
                                title="Change labels" 
                                onClick={(e) => { e.stopPropagation(); setShowLabelSelector(!showLabelSelector); setShowPalette(false); }}
                                style={{color: textColor}}
                            >
                                <Tag size={18} />
                            </button>
                            {showLabelSelector && (
                                <div className="label-selector-popup" onClick={(e) => e.stopPropagation()}>
                                    <div className="label-search">
                                        <input 
                                            type="text" 
                                            placeholder="Enter label name" 
                                            value={labelSearch}
                                            onChange={(e) => setLabelSearch(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                        <div className="label-list">
                            {(allLabels || []).filter(l => l && l.name && l.name.toLowerCase().includes(labelSearch.toLowerCase())).map(label => {
                                const isChecked = note.labels && note.labels.some(nl => nl && (nl._id || nl) === label._id);
                                return (
                                                <div key={label._id} className="label-item" onClick={() => handleLabelToggle(label._id)}>
                                                    <input type="checkbox" checked={isChecked} readOnly />
                                                    <span>{label.name}</span>
                                                </div>
                                            );
                                        })}
                                        {labelSearch && !allLabels.some(l => l.name.toLowerCase() === labelSearch.toLowerCase()) && (
                                            <div className="label-create-item" onClick={handleCreateLabelClick}>
                                                <span className="plus">+</span>
                                                <span>Create "{labelSearch}"</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <button 
                            className={`action-btn ${note.isArchived ? 'active' : ''}`} 
                            title={note.isArchived ? "Unarchive" : "Archive"} 
                            onClick={handleArchiveClick}
                            style={{color: textColor}}
                        >
                        <Archive size={18} />
                        </button>
                        
                        <button className="action-btn" title="Delete" onClick={handleTrashClick} style={{color: textColor}}>
                        <Trash2 size={18} />
                        </button>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default NoteCard;
