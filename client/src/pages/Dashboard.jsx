import React, { useEffect, useState } from 'react';
import CreateNote from '../components/CreateNote';
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
import './Dashboard.css';

const Dashboard = ({ type = 'notes' }) => {
  const [notes, setNotes] = useState([]);
  const { labels, addLabel, refreshLabels } = useLabels(); // Use Context
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

  const handleNoteCreated = () => {
    fetchNotes();
  };

  const handleArchive = async (id) => {
    try {
        const note = notes.find(n => n._id === id);
        if (note && note.isArchived) {
            await unarchiveNote(id);
        } else {
            await archiveNote(id);
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
          fetchNotes(); // Full refresh to get populated labels back
      } catch (error) {
          console.error("Error updating labels", error);
      }
  };

  const handleCreateLabel = async (name) => {
      try {
          await addLabel(name); // Use context method
          // No need to refreshLabels explicitly, context handles state update
      } catch (error) {
          console.error("Error creating label", error);
      }
  };

  const handlePin = async (id) => {
      try {
          // Import togglePin at top first? I need to update imports.
          // Assuming I will update imports in next step or use updateNote if it worked, but togglePin is safer.
          // Let's assume togglePin is imported.
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

  return (
    <div className="dashboard-container">
      {/* CreateNote removed to separate page as per user request */}
      
      {loading ? (
        <div className="loading">Loading notes...</div>
      ) : (
        <div className="notes-grid">
          {notes
            .filter(note => {
                const query = (searchQuery || '').toLowerCase();
                const titleMatch = note.title?.toLowerCase().includes(query);
                const descMatch = note.description?.toLowerCase().includes(query);
                return titleMatch || descMatch;
            })
            .map((note) => (
            <NoteCard 
                key={note._id} 
                note={note} 
                allLabels={labels} // Pass all available labels
                onArchive={handleArchive}
                onTrash={handleTrash}
                onRestore={handleRestore}
                onDeleteForever={handleDeleteForever}
                onColorChange={handleColorChange}
                onLabelChange={handleLabelChange} // Handler for changing labels
                onCreateLabel={handleCreateLabel} // Handler for creating new label
                onPin={handlePin}
                searchQuery={searchQuery}
                onUpdate={() => handleNoteClick(note)}
                onClick={() => handleNoteClick(note)}
            />
          ))}
          {notes.length === 0 && <div className="empty-state">
              {type === 'trash' ? 'NOTHING IN TRASH' : 
               type === 'archive' ? 'NOTHING IN ARCHIVE' : 
               'NOTHING IN NOTES'}
          </div>}
        </div>
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
