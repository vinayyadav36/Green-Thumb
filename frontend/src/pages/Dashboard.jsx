import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [userId, setUserId] = useState('');
  const [subscriptions, setSubscriptions] = useState([]);
  const [guides, setGuides] = useState([]);

  useEffect(() => {
    fetch('/api/guides')
      .then(res => res.json())
      .then(data => setGuides(data))
      .catch(err => console.error('Error fetching guides:', err));
  }, []);

  const fetchSubscriptions = () => {
    fetch(`/api/users/${userId}/subscriptions`)
      .then(res => res.json())
      .then(data => setSubscriptions(data.subscriptions || []))
      .catch(err => console.error('Error fetching subscriptions:', err));
  };

  return (
    <div>
      <h1>My Dashboard</h1>
      <div>
        <input
          type="text"
          placeholder="Enter your User ID"
          value={userId}
          onChange={e => setUserId(e.target.value)}
        />
        <button onClick={fetchSubscriptions}>Load Subscriptions</button>
      </div>

      <h2>My Subscriptions</h2>
      {subscriptions.length === 0 ? <p>No subscriptions found.</p> : (
        <div className="boxes-container">
          {subscriptions.map(box => {
            const boxGuides = guides.filter(g => g.boxId === box.id);
            return (
              <div key={box.id} className="box-card">
                <h3>{box.name} ({box.season})</h3>
                <h4>Care Guides:</h4>
                <ul>
                  {boxGuides.map(guide => (
                    <li key={guide.id}>
                      <strong>{guide.title}</strong>: {guide.content}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
