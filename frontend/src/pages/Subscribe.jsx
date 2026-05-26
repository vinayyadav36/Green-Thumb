import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Subscribe() {
  const { boxId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', userId: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, boxId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          alert('Successfully subscribed!');
          navigate('/dashboard');
        }
      })
      .catch(err => console.error('Subscription error:', err));
  };

  return (
    <div>
      <h1>Subscribe to Box</h1>
      <p>Box ID: {boxId}</p>
      <form onSubmit={handleSubmit}>
        <div>
          <label>User ID (mock): </label>
          <input type="text" name="userId" value={formData.userId} onChange={handleChange} required />
        </div>
        <div>
          <label>Name: </label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <label>Email: </label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <button type="submit">Complete Subscription</button>
      </form>
    </div>
  );
}

export default Subscribe;
