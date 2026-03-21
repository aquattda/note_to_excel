function SyncNotice({ result }) {
  if (!result) {
    return null;
  }

  const isSuccess = result.excelSyncStatus === 'success';

  return (
    <div className={`card ${isSuccess ? 'success' : 'warning'}`}>
      <h3>{isSuccess ? 'Database and Excel synchronized' : 'Database saved, Excel pending sync'}</h3>
      <p>{result.message}</p>
      <p>Status: {result.excelSyncStatus}</p>
    </div>
  );
}

export default SyncNotice;
