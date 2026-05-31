import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function GuideDetail() {
  const { id } = useParams();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSavedOffline, setIsSavedOffline] = useState(false);
  const [isOfflineData, setIsOfflineData] = useState(false);

  useEffect(() => {
    // Check if we already have it in localStorage first to set the button state
    const cachedGuide = localStorage.getItem(`guide_${id}`);
    if (cachedGuide) {
      setIsSavedOffline(true);
    }

    fetch(`/api/guides/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch guide');
        return res.json();
      })
      .then(data => {
        setGuide(data);
        setLoading(false);
        setIsOfflineData(false);
      })
      .catch(err => {
        console.error('Network error, checking local cache:', err);
        if (cachedGuide) {
          setGuide(JSON.parse(cachedGuide));
          setIsOfflineData(true);
        } else {
          setError('Guide not found and no offline copy available.');
        }
        setLoading(false);
      });
  }, [id]);

  const handleSaveOffline = () => {
    if (guide) {
      localStorage.setItem(`guide_${id}`, JSON.stringify(guide));
      setIsSavedOffline(true);
      alert('Guide saved for offline reading!');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading guide...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;
  if (!guide) return <div style={{ padding: '2rem' }}>Guide not found.</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>{guide.title}</h1>
        {isOfflineData && <span style={{ background: '#f59e0b', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Offline Version</span>}
      </div>
      <div style={{ background: '#dcfce7', color: '#166534', display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: '4px', marginBottom: '2rem' }}>
        <strong>Plant:</strong> {guide.plantName || guide.boxId}
      </div>

      <div style={{ lineHeight: '1.6', fontSize: '1.1rem', marginBottom: '2rem' }}>
        <p>{guide.content}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <div>
          <strong>💧 Watering:</strong> <br />
          {guide.watering || 'Not specified'}
        </div>
        <div>
          <strong>☀️ Sunlight:</strong> <br />
          {guide.sunlight || 'Not specified'}
        </div>
        <div>
          <strong>🪴 Soil:</strong> <br />
          {guide.soil || 'Not specified'}
        </div>
        <div>
          <strong>📅 Seasonal Tips:</strong> <br />
          {guide.seasonalTips || 'Not specified'}
        </div>
      </div>

      {!isSavedOffline && !isOfflineData && (
        <button onClick={handleSaveOffline} style={{ padding: '0.8rem 1.5rem', background: 'transparent', color: '#166534', border: '2px solid #166534', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Save Offline
        </button>
      )}
      {isSavedOffline && !isOfflineData && (
        <p style={{ color: '#10b981', fontWeight: 'bold' }}>✓ Saved for offline reading</p>
      )}
    </div>
  );
}

export default GuideDetail;
