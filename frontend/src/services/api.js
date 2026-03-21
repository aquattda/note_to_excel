const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed');
  }

  return data;
}

export const api = {
  createNote(payload) {
    return request('/api/notes', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  listGroups() {
    return request('/api/groups');
  },
  getGroup(groupId) {
    return request(`/api/groups/${groupId}`);
  },
  getGroupNotes(groupId) {
    return request(`/api/groups/${groupId}/notes`);
  },
  renameGroup(groupId, displayName) {
    return request(`/api/groups/${groupId}`, {
      method: 'PATCH',
      body: JSON.stringify({ displayName })
    });
  },
  updateNote(noteId, payload) {
    return request(`/api/notes/${noteId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },
  deleteNote(noteId) {
    return request(`/api/notes/${noteId}`, {
      method: 'DELETE'
    });
  },
  getExcelDownloadUrl() {
    return `${API_BASE_URL}/api/excel/download`;
  }
};
