import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [boxes, setBoxes] = useState([]);
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/boxes').then(res => {
        if (!res.ok) throw new Error('Failed to fetch boxes');
        return res.json();
      }),
      fetch('/api/guides').then(res => {
        if (!res.ok) throw new Error('Failed to fetch guides');
        return res.json();
      })
    ])
      .then(([boxesData, guidesData]) => {
        setBoxes(boxesData);
        setGuides(guidesData.slice(0, 3)); // Get top 3 featured guides
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div>
        <section className="hero">
          <h1>Grow with the seasons</h1>
          <p>Loading...</p>
        </section>
        <div className="skeleton-container" style={{ padding: '2rem' }}>
          <p>Loading boxes and guides...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', color: 'red', textAlign: 'center' }}>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <section className="hero">
        <h1>Grow with the seasons</h1>
        <p>Subscribe to our seasonal plant boxes and enjoy fresh additions to your garden all year round.</p>
        <a href="#boxes" className="cta-button">Explore Boxes</a>
      </section>

      <section id="boxes">
        <h2>Seasonal Plant Boxes</h2>
        <div className="boxes-container">
          {boxes.map(box => (
            <div key={box.id} className="box-card">
              <span className="season-badge">{box.season}</span>
              <h3>{box.name}</h3>
              <p>{box.description}</p>
              <p><strong>Plants:</strong> {box.contents.join(', ')}</p>
              <p className="price">${box.price || '35.00'}</p>
              <Link to={`/boxes/${box.id}`}>
                <button>View Details</button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section id="featured-guides" style={{ marginTop: '2rem' }}>
        <h2>Featured Guides</h2>
        <div className="guides-container">
          {guides.map(guide => (
            <div key={guide.id} className="guide-card" style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0' }}>
              <h3>{guide.title}</h3>
              <p><strong>Plant:</strong> {guide.plantName || guide.boxId}</p>
              <Link to={`/guides/${guide.id}`}>Read Guide</Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
