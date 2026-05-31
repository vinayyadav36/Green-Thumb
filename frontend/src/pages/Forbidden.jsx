import React from 'react';
import { Link } from 'react-router-dom';

function Forbidden() {
  return (
    <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#166534', backgroundColor: '#f0fdf4', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>403 - Access Denied</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        You do not have permission to view this page. This area requires administrator privileges.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/" style={{ padding: '0.8rem 1.5rem', background: '#166534', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
          Back to Home
        </Link>
        <Link to="/login" style={{ padding: '0.8rem 1.5rem', background: 'transparent', color: '#166534', border: '2px solid #166534', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
          Go to Login
        </Link>
      </div>
    </div>
  );
}

export default Forbidden;
