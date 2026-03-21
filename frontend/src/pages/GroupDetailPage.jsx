import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';

function GroupDetailPage() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingGroupName, setEditingGroupName] = useState('');

  const hasNotes = useMemo(() => notes.length > 0, [notes]);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const response = await api.getGroupNotes(id);
      setGroup(response.group);
      setEditingGroupName(response.group.displayName);
      setNotes(response.notes || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  async function handleUpdateNote(noteId, payload) {
    await api.updateNote(noteId, payload);
    await loadData();
  }

  async function handleDeleteNote(noteId) {
    await api.deleteNote(noteId);
    await loadData();
  }

  async function handleRenameGroup(event) {
    event.preventDefault();
    await api.renameGroup(id, editingGroupName);
    await loadData();
  }

  if (loading) {
    return <div className="card">Loading group detail...</div>;
  }

  if (error) {
    return <div className="card error">{error}</div>;
  }

  return (
    <section className="card stack">
      <Link className="button ghost" to="/">
        Back
      </Link>

      <h2>Group: {group.displayName}</h2>
      <p>Sheet: {group.sheetName}</p>

      <form className="inline-form" onSubmit={handleRenameGroup}>
        <input value={editingGroupName} onChange={(e) => setEditingGroupName(e.target.value)} />
        <button className="button" type="submit">
          Rename group
        </button>
      </form>

      {!hasNotes ? (
        <p>No notes in this group.</p>
      ) : (
        <div className="notes-table-wrapper">
          <table className="notes-table">
            <thead>
              <tr>
                <th>Content</th>
                <th>URL</th>
                <th>Annotation</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note) => (
                <tr key={note._id}>
                  <td>{note.originalContent}</td>
                  <td>
                    <a href={note.url} target="_blank" rel="noreferrer">
                      Open
                    </a>
                  </td>
                  <td>{note.annotation || '-'}</td>
                  <td>{new Date(note.createdAt).toLocaleString()}</td>
                  <td>
                    <button
                      className="button ghost"
                      onClick={() =>
                        handleUpdateNote(note._id, {
                          annotation: `${note.annotation || ''} (edited)`.trim()
                        })
                      }
                    >
                      Quick edit
                    </button>
                    <button className="button danger" onClick={() => handleDeleteNote(note._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default GroupDetailPage;
