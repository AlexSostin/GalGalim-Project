import React from 'react';
import { Link } from 'react-router-dom';
import './AccessDenied.css';

const AccessDenied = () => {
  return (
    <div className="access-denied">
      <h2>Access Denied</h2>
      <p>Sorry, you don't have permission to view this page.</p>
      <Link to="/" className="back-link">Back to Home</Link>
    </div>
  );
};

export default AccessDenied;