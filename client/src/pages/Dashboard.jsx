import React, { useEffect, useState } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { Lightbulb, Archive, Trash2 } from 'lucide-react';
import NoteCard from '../components/NoteCard';
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
    togglePin
} from '../services/note.service';
import { useLabels } from '../context/LabelContext';
import { useSearch } from '../context/SearchContext';

const Dashboard = ({ type = 'notes' }) => {
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
  }, [type]);

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

  const filteredNotes = notes.filter(note => {
    const query = (searchQuery || '').toLowerCase();
    const titleMatch = note.title?.toLowerCase().includes(query);
    const descMatch = note.description?.toLowerCase().includes(query);
    return titleMatch || descMatch;
  });

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const otherNotes = filteredNotes.filter(n => !n.isPinned);

  const renderMasonryGrid = (notesList) => (
    <div className="masonry-grid">
      {notesList.map((note) => (
        <div key={note._id} className="masonry-item">
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
            onUpdate={() => handleNoteClick(note)}
            onClick={() => handleNoteClick(note)}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="dashboard-content py-4 px-2">
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
              {renderMasonryGrid(pinnedNotes)}
            </div>
          )}

          {otherNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && <div className="section-title">Others</div>}
              {renderMasonryGrid(otherNotes)}
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
