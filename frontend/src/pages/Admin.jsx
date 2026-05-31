import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

function Admin() {
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('boxes');
  const { user, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!isAdmin) {
      navigate('/403');
    }
  }, [user, isAdmin, navigate]);

  const [boxes, setBoxes] = useState([]);
  const [guides, setGuides] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [auditLog, setAuditLog] = useState([]);

  const [editingBoxId, setEditingBoxId] = useState(null);
  const [boxForm, setBoxForm] = useState({ season: 'Spring', name: '', contents: '', description: '', price: '' });

  const [editingGuideId, setEditingGuideId] = useState(null);
  const [guideForm, setGuideForm] = useState({ title: '', plantName: '', boxId: '', content: '', watering: '', sunlight: '', soil: '', seasonalTips: '' });

  useEffect(() => {
    if (isAdmin) {
      fetchBoxes();
      fetchGuides();
      fetchSubscriptions();
      fetchAuditLog();
    }
  }, [isAdmin]);

  const fetchBoxes = () => {
    fetch('/api/boxes')
      .then(res => res.json())
      .then(data => setBoxes(data))
      .catch(err => console.error('Error fetching boxes:', err));
  };

  const fetchGuides = () => {
    fetch('/api/guides')
      .then(res => res.json())
      .then(data => setGuides(data))
      .catch(err => console.error('Error fetching guides:', err));
  };

  const fetchSubscriptions = () => {
    fetch('/api/subscriptions', { headers: { 'x-user-role': 'admin' } })
      .then(res => res.json())
      .then(data => setSubscriptions(data))
      .catch(err => console.error('Error fetching subscriptions:', err));
  };

  const fetchAuditLog = () => {
    fetch('/api/admin/audit', { headers: { 'x-user-role': 'admin' } })
      .then(res => res.json())
      .then(data => setAuditLog(data))
      .catch(err => console.error('Error fetching audit log:', err));
  };

  const seedDatabase = () => {
    fetch('/api/admin/seed', {
      method: 'POST',
      headers: {
        'x-user-role': 'admin'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) setMessage(data.error);
        else {
          setMessage(data.message);
          fetchBoxes();
        }
      })
      .catch(err => setMessage('Error seeding database: ' + err.message));
  };

  const handleBoxChange = (e) => {
    setBoxForm({ ...boxForm, [e.target.name]: e.target.value });
  };

  const saveBox = (e) => {
    e.preventDefault();
    const payload = {
      ...boxForm,
      contents: typeof boxForm.contents === 'string' ? boxForm.contents.split(',').map(s => s.trim()) : boxForm.contents
    };

    const url = editingBoxId ? `/api/boxes/${editingBoxId}` : '/api/boxes';
    const method = editingBoxId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'admin' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => {
        setEditingBoxId(null);
        setBoxForm({ season: 'Spring', name: '', contents: '', description: '', price: '' });
        fetchBoxes();
      })
      .catch(err => console.error('Error saving box:', err));
  };

  const editBox = (box) => {
    setEditingBoxId(box.id);
    setBoxForm({
      ...box,
      contents: Array.isArray(box.contents) ? box.contents.join(', ') : box.contents
    });
    setActiveTab('boxes');
  };

  const deleteBox = (id) => {
    if (!window.confirm('Are you sure you want to delete this box?')) return;
    fetch(`/api/boxes/${id}`, {
      method: 'DELETE',
      headers: { 'x-user-role': 'admin' }
    })
      .then(() => fetchBoxes())
      .catch(err => console.error('Error deleting box:', err));
  };

  const handleGuideChange = (e) => {
    setGuideForm({ ...guideForm, [e.target.name]: e.target.value });
  };

  const saveGuide = (e) => {
    e.preventDefault();
    const url = editingGuideId ? `/api/guides/${editingGuideId}` : '/api/guides';
    const method = editingGuideId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'admin' },
      body: JSON.stringify(guideForm)
    })
      .then(res => res.json())
      .then(() => {
        setEditingGuideId(null);
        setGuideForm({ title: '', plantName: '', boxId: '', content: '', watering: '', sunlight: '', soil: '', seasonalTips: '' });
        fetchGuides();
      })
      .catch(err => console.error('Error saving guide:', err));
  };

  const editGuide = (guide) => {
    setEditingGuideId(guide.id);
    setGuideForm(guide);
    setActiveTab('guides');
  };

  const deleteGuide = (id) => {
    if (!window.confirm('Are you sure you want to delete this guide?')) return;
    fetch(`/api/guides/${id}`, {
      method: 'DELETE',
      headers: { 'x-user-role': 'admin' }
    })
      .then(() => fetchGuides())
      .catch(err => console.error('Error deleting guide:', err));
  };

  const updateSubscriptionStatus = (id, status) => {
    fetch(`/api/subscriptions/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'admin' },
      body: JSON.stringify({ status })
    })
      .then(() => fetchSubscriptions())
      .catch(err => console.error('Error updating status:', err));
  };

  if (!isAdmin) return null; // Prevent flicker before redirect

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin Panel</h1>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <button onClick={() => setActiveTab('boxes')} style={{ padding: '0.5rem 1rem', background: activeTab === 'boxes' ? '#166534' : 'transparent', color: activeTab === 'boxes' ? 'white' : '#166534', border: '1px solid #166534', borderRadius: '4px', cursor: 'pointer' }}>Boxes</button>
        <button onClick={() => setActiveTab('guides')} style={{ padding: '0.5rem 1rem', background: activeTab === 'guides' ? '#166534' : 'transparent', color: activeTab === 'guides' ? 'white' : '#166534', border: '1px solid #166534', borderRadius: '4px', cursor: 'pointer' }}>Guides</button>
        <button onClick={() => setActiveTab('subscriptions')} style={{ padding: '0.5rem 1rem', background: activeTab === 'subscriptions' ? '#166534' : 'transparent', color: activeTab === 'subscriptions' ? 'white' : '#166534', border: '1px solid #166534', borderRadius: '4px', cursor: 'pointer' }}>Subscriptions</button>
        <button onClick={() => setActiveTab('audit')} style={{ padding: '0.5rem 1rem', background: activeTab === 'audit' ? '#166534' : 'transparent', color: activeTab === 'audit' ? 'white' : '#166534', border: '1px solid #166534', borderRadius: '4px', cursor: 'pointer' }}>Audit Log</button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <button onClick={seedDatabase} style={{ padding: '0.5rem 1rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Seed Seasonal Box Examples and Guides</button>
        {message && <p style={{ color: '#166534', marginTop: '0.5rem' }}>{message}</p>}
      </div>

      <div className="tab-content">
        {activeTab === 'boxes' && (
          <div>
            <h2>Boxes Management</h2>
            <form onSubmit={saveBox} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
              <h3>{editingBoxId ? 'Edit Box' : 'Add New Box'}</h3>
              <input type="text" name="name" placeholder="Box Name" value={boxForm.name} onChange={handleBoxChange} required style={{ padding: '0.5rem' }} />
              <select name="season" value={boxForm.season} onChange={handleBoxChange} required style={{ padding: '0.5rem' }}>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
                <option value="Autumn">Autumn</option>
                <option value="Winter">Winter</option>
              </select>
              <input type="text" name="contents" placeholder="Plants (comma separated)" value={boxForm.contents} onChange={handleBoxChange} required style={{ padding: '0.5rem' }} />
              <textarea name="description" placeholder="Description" value={boxForm.description} onChange={handleBoxChange} required style={{ padding: '0.5rem' }} />
              <input type="number" step="0.01" name="price" placeholder="Price (e.g. 35.00)" value={boxForm.price} onChange={handleBoxChange} required style={{ padding: '0.5rem' }} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" style={{ padding: '0.5rem 1rem', background: '#166534', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{editingBoxId ? 'Update Box' : 'Add Box'}</button>
                {editingBoxId && <button type="button" onClick={() => { setEditingBoxId(null); setBoxForm({ season: 'Spring', name: '', contents: '', description: '', price: '' }); }} style={{ padding: '0.5rem 1rem', background: 'gray', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>}
              </div>
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem' }}>Name</th>
                  <th style={{ padding: '0.5rem' }}>Season</th>
                  <th style={{ padding: '0.5rem' }}>Price</th>
                  <th style={{ padding: '0.5rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {boxes.map(box => (
                  <tr key={box.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.5rem' }}>{box.name}</td>
                    <td style={{ padding: '0.5rem' }}>{box.season}</td>
                    <td style={{ padding: '0.5rem' }}>${box.price || '35.00'}</td>
                    <td style={{ padding: '0.5rem' }}>
                      <button onClick={() => editBox(box)} style={{ marginRight: '0.5rem', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => deleteBox(box.id)} style={{ color: 'red', cursor: 'pointer' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'guides' && (
          <div>
            <h2>Guides Management</h2>
            <form onSubmit={saveGuide} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
              <h3>{editingGuideId ? 'Edit Guide' : 'Add New Guide'}</h3>
              <input type="text" name="title" placeholder="Guide Title" value={guideForm.title} onChange={handleGuideChange} required style={{ padding: '0.5rem' }} />
              <input type="text" name="plantName" placeholder="Plant Name" value={guideForm.plantName} onChange={handleGuideChange} style={{ padding: '0.5rem' }} />
              <select name="boxId" value={guideForm.boxId} onChange={handleGuideChange} required style={{ padding: '0.5rem' }}>
                <option value="">-- Select Box --</option>
                {boxes.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <textarea name="content" placeholder="Care Instructions" value={guideForm.content} onChange={handleGuideChange} required style={{ padding: '0.5rem' }} rows="3" />
              <input type="text" name="watering" placeholder="Watering" value={guideForm.watering} onChange={handleGuideChange} style={{ padding: '0.5rem' }} />
              <input type="text" name="sunlight" placeholder="Sunlight" value={guideForm.sunlight} onChange={handleGuideChange} style={{ padding: '0.5rem' }} />
              <input type="text" name="soil" placeholder="Soil" value={guideForm.soil} onChange={handleGuideChange} style={{ padding: '0.5rem' }} />
              <input type="text" name="seasonalTips" placeholder="Seasonal Tips" value={guideForm.seasonalTips} onChange={handleGuideChange} style={{ padding: '0.5rem' }} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" style={{ padding: '0.5rem 1rem', background: '#166534', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{editingGuideId ? 'Update Guide' : 'Add Guide'}</button>
                {editingGuideId && <button type="button" onClick={() => { setEditingGuideId(null); setGuideForm({ title: '', plantName: '', boxId: '', content: '', watering: '', sunlight: '', soil: '', seasonalTips: '' }); }} style={{ padding: '0.5rem 1rem', background: 'gray', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>}
              </div>
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem' }}>Title</th>
                  <th style={{ padding: '0.5rem' }}>Plant/Box</th>
                  <th style={{ padding: '0.5rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {guides.map(guide => (
                  <tr key={guide.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.5rem' }}>{guide.title}</td>
                    <td style={{ padding: '0.5rem' }}>{guide.plantName || guide.boxId}</td>
                    <td style={{ padding: '0.5rem' }}>
                      <button onClick={() => editGuide(guide)} style={{ marginRight: '0.5rem', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => deleteGuide(guide.id)} style={{ color: 'red', cursor: 'pointer' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div>
            <h2>Subscriptions Management</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem' }}>User</th>
                  <th style={{ padding: '0.5rem' }}>Box</th>
                  <th style={{ padding: '0.5rem' }}>Date</th>
                  <th style={{ padding: '0.5rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map(sub => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.5rem' }}>{sub.name} <br/><small>{sub.email}</small></td>
                    <td style={{ padding: '0.5rem' }}>{sub.boxId}</td>
                    <td style={{ padding: '0.5rem' }}>{new Date(sub.timestamp || Date.now()).toLocaleDateString()}</td>
                    <td style={{ padding: '0.5rem' }}>
                      <select value={sub.status || 'pending'} onChange={(e) => updateSubscriptionStatus(sub.id, e.target.value)} style={{ padding: '0.2rem' }}>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'audit' && (
          <div>
            <h2>Audit Log</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem' }}>Timestamp</th>
                  <th style={{ padding: '0.5rem' }}>Action</th>
                  <th style={{ padding: '0.5rem' }}>User</th>
                  <th style={{ padding: '0.5rem' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.slice().reverse().map((log, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.5rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                    <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{log.action}</td>
                    <td style={{ padding: '0.5rem' }}>{log.user || log.adminEmail || 'system'}</td>
                    <td style={{ padding: '0.5rem' }}>{log.details || JSON.stringify(log)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

export default Admin;
