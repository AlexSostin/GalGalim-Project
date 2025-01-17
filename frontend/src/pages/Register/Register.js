import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Register.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState('');
    const [serverErrors, setServerErrors] = useState({});
    const navigate = useNavigate();
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const savedUsername = localStorage.getItem('username');
        const savedEmail = localStorage.getItem('email');
        if (savedUsername) setUsername(savedUsername);
        if (savedEmail) setEmail(savedEmail);
    }, []);

    useEffect(() => {
        localStorage.setItem('username', username);
        localStorage.setItem('email', email);
    }, [username, email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setServerErrors({});

        if (password !== passwordConfirm) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    password2: passwordConfirm
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    setServerErrors(data.errors);
                } else if (data.detail) {
                    setError(data.detail);
                } else {
                    setError('Registration failed. Please try again.');
                }
                return;
            }

            console.log('Registration successful:', data);
            localStorage.removeItem('username');
            localStorage.removeItem('email');
            
            alert('Registration successful! Please log in.');
            navigate('/login');

        } catch (error) {
            console.error('Registration error:', error);
            setError('Server error. Please try again later.');
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            {error && <p className="error-message">{error}</p>}
            {Object.keys(serverErrors).length > 0 && (
                <div className="server-errors">
                    {Object.entries(serverErrors).map(([field, messages]) => (
                        <p key={field} className="error-message">
                            {field}: {Array.isArray(messages) ? messages.join(', ') : messages}
                        </p>
                    ))}
                </div>
            )}
            <form onSubmit={handleSubmit} className="register-form">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <div className="password-input-container">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button 
                        type="button" 
                        className="toggle-password"
                        onClick={togglePasswordVisibility}
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
                <div className="password-input-container">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        required
                    />
                    <button 
                        type="button" 
                        className="toggle-password"
                        onClick={toggleConfirmPasswordVisibility}
                    >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;