import React from 'react';

const DashboardCard = ({ title, value, color, icon }) => {
    return (
        <div className="dashboard-card">
            <div>
                <div className="card-title">{title}</div>
                <div className="card-value" style={{ color: color || 'var(--text-main)' }}>{value}</div>
            </div>
            {icon && (
                <div className="card-icon" style={{
                    fontSize: '1.5rem',
                    padding: '0.75rem',
                    background: `${color}15`,
                    color: color,
                    borderRadius: 'var(--radius-md)'
                }}>
                    {icon}
                </div>
            )}
        </div>
    );
};

export default DashboardCard;
