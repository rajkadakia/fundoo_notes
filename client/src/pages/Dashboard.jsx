import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import { Lightbulb, Archive, Trash2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import NoteCard from '../components/NoteCard';
import CreateNote from '../components/CreateNote';
import EditNoteModal from '../components/EditNoteModal';
import { 
    getAllNotes, 
    getArchivedNotes, 
    getTrashedNotes, 
    archiveNote, 
    unarchiveNote, 
    trashNote, 
    restoreNote, 
    deleteNoteForever,
    updateNote,
    togglePin,
    getNotesByLabel
} from '../services/note.service';
import { useLabels } from '../context/LabelContext';
import { useSearch } from '../context/SearchContext';

const Dashboard = ({ type = 'notes' }) => {
  const { labelId } = useParams();
  const [notes, setNotes] = useState([]);
  const { labels, addLabel } = useLabels();
  const { searchQuery } = useSearch();
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      let data;
      if (type === 'archive') {
          data = await getArchivedNotes();
      } else if (type === 'trash') {
          data = await getTrashedNotes();
      } else if (type === 'label' && labelId) {
          data = await getNotesByLabel(labelId);
      } else {
          data = await getAllNotes();
      }
      setNotes(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [type, labelId]);

  const handleArchive = async (id) => {
    try {
        const note = notes.find(n => n._id === id);
        if (note && note.isArchived) {
            await unarchiveNote(id);
        } else {
            await archiveNote(id);
            await updateNote(id, { color: '#fffde7' }); // Set to palette yellow on archive
        }
        fetchNotes();
    } catch (error) {
        console.error("Error toggling archive:", error);
    }
  };

  const handleTrash = async (id) => {
    try {
        await trashNote(id);
        fetchNotes();
    } catch (error) {
        console.error("Error trashing note:", error);
    }
  };

  const handleRestore = async (id) => {
      try {
          await restoreNote(id);
          fetchNotes();
      } catch (error) {
          console.error("Error restoring note", error);
      }
  };

  const handleDeleteForever = async (id) => {
      try {
          await deleteNoteForever(id);
          fetchNotes();
      } catch (error) {
          console.error("Error deleting note forever", error);
      }
  };

  const handleColorChange = async (id, color) => {
      try {
          await updateNote(id, { color });
          setNotes(prev => prev.map(n => n._id === id ? { ...n, color } : n));
      } catch (error) {
          console.error("Error updating color", error);
          fetchNotes(); 
      }
  };

  const handleLabelChange = async (noteId, labelIds) => {
      try {
          await updateNote(noteId, { labels: labelIds });
          fetchNotes();
      } catch (error) {
          console.error("Error updating labels", error);
      }
  };

  const handleCreateLabel = async (name) => {
      try {
          await addLabel(name);
      } catch (error) {
          console.error("Error creating label", error);
      }
  };

  const handlePin = async (id) => {
      try {
          await togglePin(id);
          fetchNotes();
      } catch (error) {
          console.error("Error toggling pin", error);
      }
  };

  const handleNoteClick = (note) => {
      if (type === 'trash') return;
      setSelectedNote(note);
  };

  const handleCloseModal = () => {
      setSelectedNote(null);
  };

  const handleNoteUpdated = () => {
      fetchNotes();
  };

  const handleUpdateNote = async (id, data) => {
      try {
          await updateNote(id, data);
          fetchNotes();
      } catch (error) {
          console.error("Error updating note:", error);
      }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, droppableId } = result;
    
    // Get the list that was dragged from
    const sourceList = droppableId === 'pinned-notes' ? pinnedNotes : otherNotes;
    const items = Array.from(notes);
    
    // Find the note in the main list
    const noteToMove = sourceList[source.index];
    const sourceIndexInMain = items.findIndex(n => n._id === noteToMove._id);
    
    // Find the replacement position in the main list
    // This is tricky because we have two separate lists.
    // For simplicity, let's just update the 'notes' array by reordering the specific sub-list
    
    const newNotes = Array.from(notes);
    const subList = droppableId === 'pinned-notes' ? [...pinnedNotes] : [...otherNotes];
    const [reorderedItem] = subList.splice(source.index, 1);
    subList.splice(destination.index, 0, reorderedItem);
    
    // Merge back into main notes list
    const mergedNotes = newNotes.map(n => {
        const updated = subList.find(s => s._id === n._id);
        return updated || n;
    });
    
    // Update state
    setNotes(mergedNotes);

    if (type !== 'notes') return;

    try {
        // Update order in backend
        await Promise.all(subList.map((note, index) => 
            updateNote(note._id, { order: index })
        ));
    } catch (error) {
        console.error("Error updating note order:", error);
        fetchNotes();
    }
  };

  const filteredNotes = notes.filter(note => {
    const query = (searchQuery || '').toLowerCase();
    const titleMatch = note.title?.toLowerCase().includes(query);
    const descMatch = note.description?.toLowerCase().includes(query);
    return titleMatch || descMatch;
  });

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const otherNotes = filteredNotes.filter(n => !n.isPinned);

  const renderMasonryGrid = (notesList, droppableId) => (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={droppableId}>
        {(provided) => (
          <div 
            className="masonry-grid"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {notesList.map((note, index) => (
              <Draggable key={note._id} draggableId={note._id} index={index}>
                {(provided) => (
                  <div 
                    className="masonry-item"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <NoteCard 
                      note={note} 
                      allLabels={labels}
                      onArchive={handleArchive}
                      onTrash={handleTrash}
                      onRestore={handleRestore}
                      onDeleteForever={handleDeleteForever}
                      onColorChange={handleColorChange}
                      onLabelChange={handleLabelChange}
                      onCreateLabel={handleCreateLabel}
                      onPin={handlePin}
                      searchQuery={searchQuery}
                      onUpdate={handleUpdateNote}
                      onClick={() => handleNoteClick(note)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );

  return (
    <div className="dashboard-content py-4 px-2">
      {(type === 'notes' || type === 'label') && !searchQuery && (
        <CreateNote onNoteCreated={fetchNotes} initialLabelId={type === 'label' ? labelId : null} />
      )}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <Spinner animation="border" variant="warning" />
          <span className="ms-3 text-muted">Loading your notes...</span>
        </div>
      ) : (
        <>
          {pinnedNotes.length > 0 && (
            <div className="mb-5">
              <div className="section-title">Pinned</div>
              {renderMasonryGrid(pinnedNotes, "pinned-notes")}
            </div>
          )}

          {otherNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && <div className="section-title">Others</div>}
              {renderMasonryGrid(otherNotes, "other-notes")}
            </div>
          )}

          {filteredNotes.length === 0 && (
            <div className="text-center py-5">
              <div className="mb-4 text-muted" style={{ opacity: 0.5 }}>
                {type === 'trash' ? <Trash2 size={80} /> : 
                 type === 'archive' ? <Archive size={80} /> : 
                 <Lightbulb size={80} />}
              </div>
              <h4 className="text-muted">
                {type === 'trash' ? 'Nothing in trash' : 
                 type === 'archive' ? 'Nothing in archive' : 
                 'Nothing in notes'}
              </h4>
              <p className="text-muted small">Your notes will appear here</p>
            </div>
          )}
        </>
      )}

      {selectedNote && (
        <EditNoteModal 
          note={selectedNote} 
          onClose={handleCloseModal} 
          onUpdate={handleNoteUpdated} 
        />
      )}
    </div>
  );
};

export default Dashboard;
