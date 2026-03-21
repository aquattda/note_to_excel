import { useState } from 'react';

const initialState = {
  originalContent: '',
  url: '',
  annotation: ''
};

function NoteForm({ onSubmit, loading }) {
  const [form, setForm] = useState(initialState);

  function onChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit(form);
    setForm(initialState);
  }

  return (
    <form className="card form-grid" onSubmit={handleSubmit}>
      <h2>Create Note</h2>
      <label>
        Main content
        <input
          required
          name="originalContent"
          value={form.originalContent}
          onChange={onChange}
          placeholder="Nhap noi dung note"
        />
      </label>

      <label>
        URL
        <input required name="url" value={form.url} onChange={onChange} placeholder="https://..." />
      </label>

      <label>
        Annotation (optional)
        <input
          name="annotation"
          value={form.annotation}
          onChange={onChange}
          placeholder="Chu thich bo sung"
        />
      </label>

      <button disabled={loading} className="button" type="submit">
        {loading ? 'Saving...' : 'Save Note'}
      </button>
    </form>
  );
}

export default NoteForm;
