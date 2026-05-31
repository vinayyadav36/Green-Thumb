import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import BoxDetail from './pages/BoxDetail.jsx';
import Subscribe from './pages/Subscribe.jsx';
import Dashboard from './pages/Dashboard.jsx';
import GuideDetail from './pages/GuideDetail.jsx';
import Guides from './pages/Guides.jsx';
import Admin from './pages/Admin.jsx';
import Login from './pages/Login.jsx';
import Forbidden from './pages/Forbidden.jsx';
import InstallPrompt from './components/InstallPrompt.jsx';
import UpdateBanner from './components/UpdateBanner.jsx';
import { AuthProvider, AuthContext } from './context/AuthContext.jsx';
import { useContext, useEffect, useState } from 'react';
import './App.css';

function Navigation() {
  const { user, isAdmin, logout } = useContext(AuthContext);

  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/#boxes">Boxes</Link></li>
        <li><Link to="/guides">Guides</Link></li>
        <li><Link to="/subscribe/new">Subscribe</Link></li>
        {user ? (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            {isAdmin && <li><Link to="/admin">Admin</Link></li>}
            <li>
              <button onClick={logout} style={{ background: 'transparent', color: '#166534', border: '1px solid #166534', borderRadius: '4px', cursor: 'pointer', padding: '0.2rem 0.5rem', marginLeft: '1rem' }}>
                Logout ({user.name})
              </button>
            </li>
          </>
        ) : (
          <li><Link to="/login" style={{ background: '#166534', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>Login</Link></li>
        )}
      </ul>
    </nav>
  );
}

function App() {
  const [syncCount, setSyncCount] = useState(0);

  useEffect(() => {
    const syncPending = async () => {
      const queue = JSON.parse(localStorage.getItem('pending_subscriptions') || '[]');
      if (queue.length === 0) return;

      if (navigator.onLine) {
        let successfulSyncs = 0;
        const failedQueue = [];

        for (const payload of queue) {
          try {
            const res = await fetch('/api/subscriptions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            if (res.ok) {
              successfulSyncs++;
              // Note: Ideally, we'd also update the status in 'my_subscriptions', but for this demo clearing the pending list works.
            } else {
              failedQueue.push(payload);
            }
          } catch (err) {
            failedQueue.push(payload);
          }
        }

        if (successfulSyncs > 0) {
          // Quick hack to force reload dashboard if we're on it, though user would likely just refresh
        }

        localStorage.setItem('pending_subscriptions', JSON.stringify(failedQueue));
        setSyncCount(failedQueue.length);
      } else {
        setSyncCount(queue.length);
      }
    };

    syncPending();
    window.addEventListener('online', syncPending);

    // Initial read
    const q = JSON.parse(localStorage.getItem('pending_subscriptions') || '[]');
    setSyncCount(q.length);

    return () => window.removeEventListener('online', syncPending);
  }, []);

  return (
    <AuthProvider>
      <div className="App">
      {syncCount > 0 && (
        <div style={{ background: '#f59e0b', color: 'white', textAlign: 'center', padding: '0.5rem', fontWeight: 'bold' }}>
          {syncCount} subscription(s) pending sync
        </div>
      )}
      <UpdateBanner />
      <InstallPrompt />
      <header>
        <Navigation />
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/boxes/:id" element={<BoxDetail />} />
          <Route path="/subscribe/:boxId" element={<Subscribe />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/guides" element={<Guides />} />
          <Route path="/guides/:id" element={<GuideDetail />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/403" element={<Forbidden />} />
        </Routes>
      </main>
      </div>
    </AuthProvider>
  );
}

export default App;
