import React from 'react';

/**
 * Reusable Vertical Timeline Component
 * @param {Array} history - Array of { status, remarks, timestamp, updatedBy }
 */
const TimelineComponent = ({ history = [] }) => {
    if (!history || history.length === 0) return <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No history available yet.</div>;

    const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', paddingLeft: '1rem' }}>
            {/* Vertical Line */}
            <div style={{ 
                position: 'absolute', left: '1.5rem', top: '10px', bottom: '10px', 
                width: '1px', background: 'var(--border-color)'
            }}></div>

            {sortedHistory.map((item, index) => {
                const isLatest = index === 0;
                const isRejected = (item.status || '').toUpperCase().includes('REJECTED');
                const isSuccess = (item.status || '').toUpperCase().includes('APPROVED') || (item.status || '').toUpperCase() === 'SELECTED';

                return (
                    <div key={item._id || index} style={{ 
                        display: 'flex', 
                        gap: '1.5rem', 
                        position: 'relative', 
                        zIndex: 1,
                        padding: '1.25rem',
                        background: isLatest ? 'white' : 'transparent',
                        border: isLatest ? '1px solid var(--border-color)' : 'none',
                        borderRadius: 'var(--radius-sm)',
                        boxShadow: isLatest ? 'var(--shadow-sm)' : 'none'
                    }}>
                        {/* Dot */}
                        <div style={{ 
                            width: '10px', height: '10px', borderRadius: '50%', 
                            background: isRejected ? 'var(--danger)' : isSuccess ? 'var(--success)' : 'var(--primary)',
                            marginTop: '4px', marginLeft: '-0.15rem',
                            border: '3px solid white',
                            boxShadow: `0 0 0 1px ${isRejected ? 'var(--danger)' : isSuccess ? 'var(--success)' : 'var(--primary)'}`,
                            flexShrink: 0
                        }}></div>

                        {/* Content */}
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                                <span style={{ 
                                    fontWeight: '850', fontSize: '0.75rem', 
                                    color: isRejected ? 'var(--danger)' : isSuccess ? 'var(--success)' : 'var(--primary)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    {item.status?.replace('_', ' ')}
                                </span>
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '800' }}>
                                    {new Date(item.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div style={{ 
                                padding: '0.75rem', 
                                background: '#f8fafc', 
                                border: '1px solid #edf2f7', 
                                borderRadius: '2px',
                                marginBottom: '0.5rem'
                            }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '550', margin: 0, lineHeight: '1.5' }}>
                                    {item.remarks || 'No formal remarks provided.'}
                                </p>
                            </div>
                            {item.updatedBy && (
                                <div style={{ 
                                    fontSize: '0.65rem', 
                                    fontWeight: '900', 
                                    color: 'var(--text-muted)',
                                    textTransform: 'uppercase',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem'
                                }}>
                                   <span style={{ color: 'var(--primary)' }}>AUTHORITY:</span> {item.updatedBy.facultyName || item.updatedBy.name || 'SYSTEM ADMIN'}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default TimelineComponent;
