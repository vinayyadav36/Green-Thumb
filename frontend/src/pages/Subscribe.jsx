import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Subscribe() {
  const { boxId } = useParams();
  const navigate = useNavigate();
  const [boxes, setBoxes] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    boxId: boxId || '',
    address: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetch('/api/boxes')
      .then(res => res.json())
      .then(data => {
        setBoxes(data);
        if (!formData.boxId && data.length > 0) {
          setFormData(prev => ({ ...prev, boxId: data[0].id }));
        }
      })
      .catch(err => console.error('Error fetching boxes:', err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }
    if (!formData.boxId) newErrors.boxId = 'Please select a box';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = { ...formData };

    fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          setSuccessMsg(`Successfully subscribed! Redirecting to dashboard...`);
          // Save to local storage for offline view
          const savedSubs = JSON.parse(localStorage.getItem('my_subscriptions') || '[]');
          savedSubs.push(data.subscription || payload);
          localStorage.setItem('my_subscriptions', JSON.stringify(savedSubs));
          setTimeout(() => navigate('/dashboard'), 2000);
        }
      })
      .catch(err => {
        console.error('Subscription error, saving offline:', err);
        // Queue for offline
        const queue = JSON.parse(localStorage.getItem('pending_subscriptions') || '[]');
        queue.push(payload);
        localStorage.setItem('pending_subscriptions', JSON.stringify(queue));

        // Also save to standard viewable cache
        const savedSubs = JSON.parse(localStorage.getItem('my_subscriptions') || '[]');
        savedSubs.push({ ...payload, status: 'pending (offline)' });
        localStorage.setItem('my_subscriptions', JSON.stringify(savedSubs));

        setSuccessMsg('Saved locally — will submit when you are back online.');
        setTimeout(() => navigate('/dashboard'), 3000);
      });
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Subscribe to a Box</h1>
      {successMsg && <div style={{ padding: '1rem', background: '#dcfce7', color: '#166534', marginBottom: '1rem', borderRadius: '4px' }}>{successMsg}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label>Full Name *</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }} />
          {errors.name && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.name}</span>}
        </div>
        <div>
          <label>Email *</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }} />
          {errors.email && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.email}</span>}
        </div>
        <div>
          <label>Phone (optional)</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }} />
        </div>
        <div>
          <label>Select a Box *</label>
          <select name="boxId" value={formData.boxId} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }}>
            <option value="">-- Choose a Box --</option>
            {boxes.map(b => (
              <option key={b.id} value={b.id}>{b.name} ({b.season})</option>
            ))}
          </select>
          {errors.boxId && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.boxId}</span>}
        </div>
        <div>
          <label>Delivery Address</label>
          <textarea name="address" value={formData.address} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }} rows="3" />
        </div>
        <div>
          <label>Message (optional)</label>
          <textarea name="message" value={formData.message} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }} rows="2" />
        </div>
        <button type="submit" style={{ padding: '1rem', background: '#166534', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1rem' }}>
          Complete Subscription
        </button>
      </form>
    </div>
  );
}

export default Subscribe;
