import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/api';

const notifTypeBadge = (type) => {
    const map = {
        URGENT: { bg: '#fee2e2', color: '#dc2626' },
        NEW: { bg: '#eff6ff', color: '#2563eb' },
        SUCCESS: { bg: '#d1fae5', color: '#059669' },
        UPDATE: { bg: '#fef3c7', color: '#d97706' },
        INFO: { bg: '#f1f5f9', color: '#64748b' },
    };
    const s = map[type] || map.INFO;
    return { background: s.bg, color: s.color, fontSize: '0.58rem', fontWeight: '800', padding: '2px 7px', borderRadius: '4px', letterSpacing: '0.03em' };
};

const Header = ({ toggleSidebar }) => {
    const { user } = useAuth();
    const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
    const location = useLocation();
    const navigate = useNavigate();
    const [studentProfile, setStudentProfile] = useState(null);
    const [showNotifs, setShowNotifs] = useState(false);
    const notifRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotifs(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (user?.role === 'student') {
            fetchStudentProfile();
        }

        const handleProfileUpdate = () => {
            if (user?.role === 'student') {
                fetchStudentProfile();
            }
        };

        window.addEventListener('profileUpdated', handleProfileUpdate);
        return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
    }, [user]);

    const fetchStudentProfile = async () => {
        try {
            const response = await api.get('/student/profile');
            setStudentProfile(response.data.data);
        } catch (err) {
            console.error('Failed to fetch profile in header:', err);
        }
    };

    const getFullURL = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
        const baseURL = apiURL.split('/api/v1')[0];
        return `${baseURL}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const getBreadcrumbs = () => {
        const path = location.pathname.split('/').filter(x => x);
        if (path.length === 0) return <span>DASHBOARD</span>;
        return path.map((p, i) => (
            <span key={i} className={i === path.length - 1 ? 'breadcrumb-active' : ''}>
                {p.toUpperCase()} {i < path.length - 1 && ' > '}
            </span>
        ));
    };

    const handleNotifClick = (id) => {
        markRead(id);
    };

    const displayName = studentProfile?.name || user?.name || 'USER';
    const photoURL = studentProfile?.photoURL;

    return (
        <header className="main-header">
            <div className="header-left">
                <button
                    className="mobile-sidebar-toggle"
                    onClick={toggleSidebar}
                >
                    ☰
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ 
                        width: '45px', 
                        height: '45px', 
                        background: 'var(--primary)', 
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '1.5rem',
                        fontWeight: '900'
                    }}>🏛️</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: '850', color: 'var(--primary)', margin: 0, lineHeight: '1.2' }}>
                            National Internship & Placement Portal
                        </h1>
                        <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Department of Higher Education • Government of Institutional Excellence
                        </p>
                    </div>
                </div>
            </div>

            <div className="header-right">
                {/* ── Notification Bell + Dropdown ────────────────────── */}
                <div className="notif-dropdown-wrapper" ref={notifRef}>
                    <div
                        className="notification-badge"
                        onClick={() => setShowNotifs(prev => !prev)}
                        style={{ cursor: 'pointer' }}
                    >
                        <span style={{ fontSize: '1.4rem' }}>🔔</span>
                        {unreadCount > 0 && <div className="badge-dot"></div>}
                    </div>

                    {showNotifs && (
                        <div className="notif-dropdown">
                            <div className="notif-dropdown-header">
                                <h4>NOTIFICATIONS</h4>
                                <span
                                    className="notif-mark-read"
                                    onClick={(e) => { e.stopPropagation(); markAllRead(); }}
                                >
                                    MARK ALL READ
                                </span>
                            </div>

                            <div className="notif-dropdown-list">
                                {notifications.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                                        No notifications
                                    </div>
                                ) : (
                                    // Limit dropdown to 7 most recent
                                    notifications.slice(0, 7).map(notif => (
                                        <div
                                            key={notif.id}
                                            className={`notif-dropdown-item ${!notif.read ? 'notif-unread' : ''}`}
                                            onClick={() => handleNotifClick(notif.id)}
                                        >
                                            <div className="notification-icon">{notif.icon}</div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{
                                                    fontSize: '0.85rem', fontWeight: notif.read ? '500' : '700',
                                                    color: 'var(--text-main)', marginBottom: '0.15rem',
                                                    lineHeight: '1.4',
                                                }}>
                                                    {notif.message}
                                                </p>
                                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                                                    {notif.time}
                                                </span>
                                            </div>
                                            <span style={notifTypeBadge(notif.type)}>{notif.type}</span>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="notif-dropdown-footer">
                                <span onClick={() => { navigate('/notifications'); setShowNotifs(false); }}>
                                    View All Notifications →
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="user-profile">
                    <div className="user-info">
                        <span className="user-name">{displayName}</span>
                        <span className="user-role-badge">{user?.role?.toUpperCase()}</span>
                    </div>
                    <div className="user-avatar-small">
                        <div className="avatar-inner" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {photoURL ? (
                                <img
                                    src={getFullURL(photoURL)}
                                    alt="Profile"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                displayName.charAt(0).toUpperCase()
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
