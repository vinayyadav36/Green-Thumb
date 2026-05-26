import React, { useState } from 'react';

function Admin() {
  const [message, setMessage] = useState('');

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
        else setMessage(data.message);
      })
      .catch(err => setMessage('Error seeding database: ' + err.message));
  };

  return (
    <div>
      <h1>Admin Panel</h1>
      <button onClick={seedDatabase}>Seed Seasonal Box Examples and Guides</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Admin;
