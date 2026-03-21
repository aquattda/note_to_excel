import { Link, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GroupDetailPage from './pages/GroupDetailPage';

function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>Note To Excel</h1>
          <p>Save note -&gt; MongoDB -&gt; sync Excel immediately</p>
        </div>
        <Link className="button ghost" to="/">
          Home
        </Link>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/groups/:id" element={<GroupDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
