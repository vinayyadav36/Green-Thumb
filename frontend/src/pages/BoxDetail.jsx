import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

function BoxDetail() {
  const { id } = useParams();
  const [box, setBox] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/boxes/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch box details');
        return res.json();
      })
      .then(data => {
        setBox(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching box:', err);
        setError('Failed to load box details.');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div style={{ padding: '2rem' }}>Loading box details...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;
  if (!box) return <div style={{ padding: '2rem' }}>Box not found.</div>;

  return (
    <div className="box-detail" style={{ padding: '2rem' }}>
      <h1>{box.name} <span className="season-badge" style={{ fontSize: '1rem', background: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{box.season}</span></h1>
      <p className="price" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${box.price || '35.00'}</p>
      <p className="description" style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>{box.description}</p>

      <div className="contents-section" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h2>What's Included</h2>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {box.contents.map((item, idx) => (
            <li key={idx} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>🌿 {item}</li>
          ))}
        </ul>
      </div>

      <div className="cta-section">
        <Link to={`/subscribe/${box.id}`}>
          <button style={{ padding: '1rem 2rem', fontSize: '1.2rem', background: '#166534', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Subscribe / Express Interest
          </button>
        </Link>
      </div>
    </div>
  );
}

export default BoxDetail;
