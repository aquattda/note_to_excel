import { useEffect, useState } from 'react';
import NoteForm from '../components/NoteForm';
import GroupsList from '../components/GroupsList';
import SyncNotice from '../components/SyncNotice';
import { api } from '../services/api';

function HomePage() {
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  async function loadGroups() {
    setGroupsLoading(true);
    setGroupsError('');
    try {
      const response = await api.listGroups();
      setGroups(response.groups || []);
    } catch (error) {
      setGroupsError(error.message);
    } finally {
      setGroupsLoading(false);
    }
  }

  useEffect(() => {
    loadGroups();
  }, []);

  async function handleCreateNote(payload) {
    setSubmitting(true);
    try {
      const response = await api.createNote(payload);
      setSyncResult(response);
      await loadGroups();
    } catch (error) {
      setSyncResult({
        excelSyncStatus: 'failed',
        message: error.message
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="layout-grid">
      <div>
        <NoteForm onSubmit={handleCreateNote} loading={submitting} />
        <SyncNotice result={syncResult} />
        <a className="button" href={api.getExcelDownloadUrl()}>
          Download current Excel
        </a>
      </div>
      <GroupsList groups={groups} loading={groupsLoading} error={groupsError} />
    </section>
  );
}

export default HomePage;
