import React from 'react';
import { Link } from 'react-router-dom';
import './styles/AccessDenied.css';

const AccessDenied = () => {
    return (
        <div className="access-denied">
            <div className="access-denied-container">
                <h1>Access Denied</h1>
                <p>You don't have permission to view this page.</p>
                <Link to="/" className="back-home">
                    Back to Home
                </Link>
            </div>
        </div>
    );
};

export default AccessDenied;