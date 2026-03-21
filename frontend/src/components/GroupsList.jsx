import { Link } from 'react-router-dom';

function GroupsList({ groups, loading, error }) {
  if (loading) {
    return <div className="card">Loading groups...</div>;
  }

  if (error) {
    return <div className="card error">{error}</div>;
  }

  if (!groups.length) {
    return <div className="card">No groups yet. Create your first note.</div>;
  }

  return (
    <div className="card">
      <h2>Groups</h2>
      <div className="group-list">
        {groups.map((group) => (
          <article key={group._id} className="group-item">
            <div>
              <h3>{group.displayName}</h3>
              <p>Notes: {group.noteCount}</p>
              <p>Sheet: {group.sheetName}</p>
            </div>
            <Link className="button ghost" to={`/groups/${group._id}`}>
              View details
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

export default GroupsList;
