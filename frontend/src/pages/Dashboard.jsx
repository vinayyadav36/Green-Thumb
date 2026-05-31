import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOfflineData, setIsOfflineData] = useState(false);

  useEffect(() => {
    // Auth Check
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (!user) throw new Error('User not found');

        const subsRes = await fetch(`/api/users/${user.id}/subscriptions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!subsRes.ok) throw new Error('Network response was not ok');
        const subsData = await subsRes.json();

        // Cache to local storage
        localStorage.setItem('my_subscriptions', JSON.stringify(subsData.subscriptions || []));
        setSubscriptions(subsData.subscriptions || []);

        const guidesRes = await fetch('/api/guides');
        if (!guidesRes.ok) throw new Error('Network response was not ok');
        const guidesData = await guidesRes.json();
        setGuides(guidesData);

        setIsOfflineData(false);
      } catch (err) {
        console.error('Error fetching dashboard data, falling back to local cache', err);
        const cachedSubs = JSON.parse(localStorage.getItem('my_subscriptions') || '[]');
        setSubscriptions(cachedSubs);
        setIsOfflineData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) return <div style={{ padding: '2rem' }}>Loading dashboard...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>My Dashboard {isOfflineData && <span style={{ fontSize: '1rem', background: '#f59e0b', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', marginLeft: '1rem' }}>Offline Mode</span>}</h1>

      <h2>My Subscriptions</h2>
      {subscriptions.length === 0 ? <p>No subscriptions found.</p> : (
        <div className="boxes-container">
          {subscriptions.map((sub, idx) => {
            const boxGuides = guides.filter(g => g.boxId === sub.boxId || g.boxId === sub.id);
            const statusColor = sub.status && sub.status.includes('pending') ? '#f59e0b' : '#10b981';

            return (
              <div key={sub.id || idx} className="box-card" style={{ marginBottom: '2rem', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>{sub.boxName || sub.name || `Box ${sub.boxId}`} {sub.season ? `(${sub.season})` : ''}</h3>
                  <span style={{ background: statusColor, color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.9rem' }}>
                    {sub.status || 'Confirmed'}
                  </span>
                </div>

                {boxGuides.length > 0 && (
                  <>
                    <h4 style={{ marginTop: '1.5rem' }}>Care Guides for this Box:</h4>
                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                      {boxGuides.map(guide => (
                        <div key={guide.id} style={{ border: '1px solid #cbd5e1', padding: '1rem', borderRadius: '4px' }}>
                          <h5 style={{ margin: '0 0 0.5rem 0' }}>{guide.title}</h5>
                          <Link to={`/guides/${guide.id}`} style={{ color: '#166534', textDecoration: 'none', fontWeight: 'bold' }}>Read Guide →</Link>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
