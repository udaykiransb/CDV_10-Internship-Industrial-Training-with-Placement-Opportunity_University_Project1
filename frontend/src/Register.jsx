import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from './api/api';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'student'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            setLoading(false);
            return;
        }

        try {
            await api.post('/auth/register', formData);
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-main)',
            padding: '2rem',
            position: 'relative'
        }}>
            {/* National Identity Bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: 'linear-gradient(to right, #ff9933 33.33%, #ffffff 33.33%, #ffffff 66.66%, #138808 66.66%)' }}></div>

            <div className="linways-card" style={{
                maxWidth: '500px',
                width: '100%',
                padding: '3rem 2.5rem',
                borderRadius: '4px',
                background: '#ffffff',
                borderTop: '6px solid var(--primary)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05)',
                position: 'relative'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-0.5px', marginBottom: '0.25rem', textTransform: 'uppercase' }}>PORTAL REGISTRATION</h2>
                    <p style={{ color: 'var(--text-muted)', fontWeight: '850', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Official Institutional Access Enrollment</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{
                            padding: '0.85rem',
                            background: '#fff1f2',
                            color: '#991b1b',
                            borderRadius: '4px',
                            marginBottom: '1.5rem',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            textAlign: 'center',
                            border: '1px solid #fda4af'
                        }}>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div style={{
                            padding: '0.85rem',
                            background: '#f0fdf4',
                            color: '#166534',
                            borderRadius: '4px',
                            marginBottom: '1.5rem',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            textAlign: 'center',
                            border: '1px solid #bbf7d0'
                        }}>
                            {success}
                        </div>
                    )}

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.7rem',
                            fontWeight: '850',
                            color: '#475569',
                            marginBottom: '0.4rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>User ID / Official Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="user@institution.edu"
                            style={{
                                width: '100%',
                                padding: '0.85rem 1rem',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.95rem',
                                fontWeight: '500',
                                color: '#1a1a1a',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.7rem',
                            fontWeight: '850',
                            color: '#475569',
                            marginBottom: '0.4rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>Choose System Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Min. 6 characters"
                            style={{
                                width: '100%',
                                padding: '0.85rem 1rem',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.95rem',
                                fontWeight: '500',
                                color: '#1a1a1a',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.7rem',
                            fontWeight: '850',
                            color: '#475569',
                            marginBottom: '0.4rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>Select Access Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '0.85rem 1rem',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.95rem',
                                fontWeight: '700',
                                color: '#1a1a1a',
                                outline: 'none',
                                background: 'white'
                            }}
                        >
                            <option value="student">STUDENT ENTITY</option>
                            <option value="recruiter">RECRUITER PARTNER</option>
                            <option value="faculty">FACULTY MENTOR</option>
                            <option value="admin">PORTAL ADMINISTRATOR</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{
                            width: '100%',
                            padding: '1rem',
                            fontSize: '0.9rem',
                            fontWeight: '950',
                            borderRadius: '4px',
                            letterSpacing: '1px'
                        }}
                    >
                        {loading ? 'INITIALIZING...' : 'INITIALIZE REGISTRATION'}
                    </button>
                </form>

                <div style={{
                    marginTop: '2.5rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid #e2e8f0',
                    textAlign: 'center'
                }}>
                    <p style={{
                        fontSize: '0.85rem',
                        color: '#64748b',
                        fontWeight: '600'
                    }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '800', textDecoration: 'none' }}>Secure Login</Link>
                    </p>
                </div>
            </div>

            {/* Official Footer */}
            <div style={{ position: 'absolute', bottom: '2rem', color: '#64748b', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.5px', textAlign: 'center', width: '100%' }}>
                © 2026 MINISTRY OF EDUCATION • INSTITUTIONAL SERVICES PORTAL
            </div>
        </div>
    );
};

export default Register;
