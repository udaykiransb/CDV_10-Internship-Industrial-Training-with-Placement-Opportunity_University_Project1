import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';

const NotificationsPage = () => {
    const { notifications, loading, markRead, markAllRead, clearAll } = useNotifications();
    const [filter, setFilter] = useState('ALL');

    const filteredNotifs = notifications.filter(n => {
        if (filter === 'ALL') return true;
        return n.type === filter;
    });

    const notifTypeBadge = (type) => {
        const map = {
            URGENT: { bg: '#fee2e2', color: '#dc2626' },
            NEW: { bg: '#eff6ff', color: '#2563eb' },
            SUCCESS: { bg: '#d1fae5', color: '#059669' },
            UPDATE: { bg: '#fef3c7', color: '#d97706' },
            INFO: { bg: '#f1f5f9', color: '#64748b' },
        };
        const s = map[type] || map.INFO;
        return { background: s.bg, color: s.color, fontSize: '0.65rem', fontWeight: '800', padding: '3px 9px', borderRadius: '6px', letterSpacing: '0.03em' };
    };

    return (
        <div className="dashboard-content animate-fade-in">
            <div className="section-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 className="section-title">Notifications</h2>
                    <p className="section-subtitle">Stay updated with your latest activities and opportunities</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn-outline" onClick={markAllRead}>Mark All Read</button>
                    <button className="btn-outline" style={{ color: '#dc2626', borderColor: '#fca5a5' }} onClick={clearAll}>Clear All</button>
                </div>
            </div>

            <div className="linways-card" style={{ padding: '0' }}>
                <div className="linways-card-header" style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                        {['ALL', 'NEW', 'URGENT', 'UPDATE', 'SUCCESS', 'INFO'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontSize: '0.8rem',
                                    fontWeight: '700',
                                    background: filter === f ? 'var(--primary)' : 'transparent',
                                    color: filter === f ? 'white' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="notif-full-list" style={{ minHeight: '400px' }}>
                    {loading ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading notifications...</div>
                    ) : filteredNotifs.length === 0 ? (
                        <div className="section-empty-state" style={{ padding: '6rem 2rem' }}>
                            <div className="empty-state-icon">🔔</div>
                            <p>No notifications found in this category.</p>
                        </div>
                    ) : (
                        filteredNotifs.map(notif => (
                            <div
                                key={notif.id}
                                className={`notif-dropdown-item ${!notif.read ? 'notif-unread' : ''}`}
                                onClick={() => markRead(notif.id)}
                                style={{
                                    padding: '1.25rem 2rem',
                                    borderBottom: '1px solid #f1f5f9',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <div className="notification-icon" style={{ fontSize: '1.5rem', width: '45px', height: '45px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {notif.icon}
                                </div>
                                <div style={{ flex: 1, minWidth: 0, marginLeft: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.25rem' }}>
                                        <p style={{
                                            fontSize: '0.95rem',
                                            fontWeight: notif.read ? '500' : '700',
                                            color: 'var(--text-main)',
                                            lineHeight: '1.4'
                                        }}>
                                            {notif.message}
                                        </p>
                                        <span style={notifTypeBadge(notif.type)}>{notif.type}</span>
                                    </div>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                                        {notif.time}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
