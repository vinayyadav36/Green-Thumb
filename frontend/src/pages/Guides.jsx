import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Guides() {
  const [guides, setGuides] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/guides')
      .then(res => res.json())
      .then(data => {
        setGuides(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching guides:', err);
        setLoading(false);
      });
  }, []);

  const filteredGuides = guides.filter(g =>
    (g.plantName || '').toLowerCase().includes(search.toLowerCase()) ||
    (g.title || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Care Guides</h1>

      <div style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Filter by plant name or title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: '400px', padding: '0.8rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
        />
      </div>

      {loading ? (
        <p>Loading guides...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {filteredGuides.length > 0 ? (
            filteredGuides.map(guide => (
              <div key={guide.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{guide.title}</h3>
                </div>
                <span style={{ display: 'inline-block', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', marginBottom: '1rem', alignSelf: 'flex-start' }}>
                  {guide.plantName || guide.boxId}
                </span>
                <p style={{ flex: 1, color: '#475569', fontSize: '0.9rem', marginBottom: '1.5rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical' }}>
                  {guide.content}
                </p>
                <Link to={`/guides/${guide.id}`} style={{ display: 'block', textAlign: 'center', padding: '0.5rem', background: '#f8fafc', color: '#166534', textDecoration: 'none', border: '1px solid #166534', borderRadius: '4px', fontWeight: 'bold' }}>
                  Read Full Guide
                </Link>
              </div>
            ))
          ) : (
            <p>No guides found matching your search.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Guides;
