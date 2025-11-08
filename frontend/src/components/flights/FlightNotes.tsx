import { useState, useEffect } from 'react';
import { useFlightHistoryStore } from '../../store/flightHistoryStore';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Plus, Edit2, Trash2, FileText, MessageSquare, BookOpen, StickyNote, User, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface FlightNotesProps {
  flightId: number;
}

export function FlightNotes({ flightId }: FlightNotesProps) {
  const { notes, loading, fetchNotes, createNote, updateNote, deleteNote } = useFlightHistoryStore();
  const { user } = useAuthStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    noteType: 'GENERAL' as 'PRE_FLIGHT' | 'POST_FLIGHT' | 'DEBRIEF' | 'GENERAL' | 'INSTRUCTOR_NOTES' | 'STUDENT_NOTES',
    content: '',
  });

  useEffect(() => {
    fetchNotes(flightId);
  }, [flightId]);

  const getNoteTypeIcon = (type: string) => {
    switch (type) {
      case 'PRE_FLIGHT':
        return <FileText className="w-4 h-4" />;
      case 'POST_FLIGHT':
        return <MessageSquare className="w-4 h-4" />;
      case 'DEBRIEF':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <StickyNote className="w-4 h-4" />;
    }
  };

  const getNoteTypeLabel = (type: string) => {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleCreate = async () => {
    if (!formData.content.trim()) {
      toast.error('Note content is required');
      return;
    }

    try {
      await createNote(flightId, formData);
      setFormData({ noteType: 'GENERAL', content: '' });
      setShowCreateForm(false);
      toast.success('Note created successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create note');
    }
  };

  const handleUpdate = async (noteId: number) => {
    if (!formData.content.trim()) {
      toast.error('Note content is required');
      return;
    }

    try {
      await updateNote(noteId, formData.content);
      setEditingNoteId(null);
      setFormData({ noteType: 'GENERAL', content: '' });
      toast.success('Note updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update note');
    }
  };

  const handleDelete = async (noteId: number) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await deleteNote(noteId);
      toast.success('Note deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete note');
    }
  };

  const startEdit = (note: any) => {
    setEditingNoteId(note.id);
    setFormData({
      noteType: note.noteType,
      content: note.content,
    });
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
    setFormData({ noteType: 'GENERAL', content: '' });
  };

  const canEditNote = (note: any) => {
    return note.authorId === user?.id || user?.role === 'ADMIN';
  };

  const filteredNotes = notes.filter((note) => {
    if (user?.role === 'STUDENT') {
      return note.noteType !== 'INSTRUCTOR_NOTES';
    }
    return true;
  });

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Flight Notes</h3>
        {!showCreateForm && !editingNoteId && (
          <Button
            onClick={() => setShowCreateForm(true)}
            variant="primary"
            size="sm"
          >
            Add Note
          </Button>
        )}
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingNoteId) && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="space-y-4">
            <Select
              label="Note Type"
              value={formData.noteType}
              onChange={(e) => setFormData({ ...formData, noteType: e.target.value as any })}
              options={[
                { value: 'PRE_FLIGHT', label: 'Pre-Flight' },
                { value: 'POST_FLIGHT', label: 'Post-Flight' },
                { value: 'DEBRIEF', label: 'Debrief' },
                { value: 'GENERAL', label: 'General' },
                { value: user?.role === 'STUDENT' ? 'STUDENT_NOTES' : 'INSTRUCTOR_NOTES', label: user?.role === 'STUDENT' ? 'Student Notes' : 'Instructor Notes' },
              ]}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Enter note content..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={editingNoteId ? () => handleUpdate(editingNoteId) : handleCreate}
                variant="primary"
                size="sm"
              >
                {editingNoteId ? 'Update' : 'Create'} Note
              </Button>
              <Button
                onClick={editingNoteId ? cancelEdit : () => setShowCreateForm(false)}
                variant="secondary"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <StickyNote className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No notes yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getNoteTypeIcon(note.noteType)}
                  <span className="text-sm font-medium text-gray-700">
                    {getNoteTypeLabel(note.noteType)}
                  </span>
                </div>
                {canEditNote(note) && !editingNoteId && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(note)}
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                      title="Edit note"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1.5 hover:bg-red-50 rounded transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                )}
              </div>

              {editingNoteId === note.id ? (
                <div className="space-y-2">
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => handleUpdate(note.id)} variant="primary" size="sm">
                      Save
                    </Button>
                    <Button onClick={cancelEdit} variant="secondary" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
              )}

              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                {note.author && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{note.author.email}</span>
                  </div>
                )}
                <span>{new Date(note.createdAt).toLocaleString()}</span>
                {note.updatedAt !== note.createdAt && (
                  <span className="text-gray-400">(edited)</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

