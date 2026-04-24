import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Portal Selector — displayed on the student's home screen
 * Two premium cards to choose between Placement Portal and Internship Portal
 */
const PortalSelector = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="page-container" style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>

            {/* Welcome header */}
            <div style={{ textAlign: 'center', marginBottom: '3.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '2.5rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: '850', color: 'var(--primary)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    Institutional Service Gateway · Government of National Capital Territory
                </p>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
                    Welcome, {user?.name || 'AUTHORIZED INDIVIDUAL'}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', fontWeight: '700', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
                    Please select the appropriate institutional sector to access specialized services. All actions within these portals are logged for official record-keeping and audit purposes.
                </p>
            </div>

            {/* Portal Cards */}
            <div className="portal-selector-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>

                {/* Placement Portal Card */}
                <div
                    id="portal-placement"
                    className="linways-card"
                    onClick={() => navigate('/placement')}
                    style={{
                        cursor: 'pointer',
                        padding: '2.5rem',
                        transition: 'var(--transition)',
                        textAlign: 'left',
                    }}
                >
                    <div style={{
                        width: '60px', height: '60px', borderRadius: '4px',
                        background: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', marginBottom: '1.5rem',
                        color: 'white'
                    }}>
                        💼
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '950', color: 'var(--primary)', marginBottom: '1rem', textTransform: 'uppercase' }}>
                        I. Placement Services
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: '500', lineHeight: '1.6', marginBottom: '1.5rem', height: '80px' }}>
                        Browse institutional placement opportunities, submit official applications, and track your recruitment journey through the government-aligned hiring pipeline.
                    </p>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem', flexWrap: 'wrap' }}>
                        {['Opportunities', 'Applications', 'Offers'].map(tag => (
                            <span key={tag} className="badge" style={{ background: '#f1f5f9', color: '#003366', border: '1px solid #cbd5e1' }}>{tag}</span>
                        ))}
                    </div>
                    <button className="btn-primary" style={{ width: '100%' }}>
                        ENTER PLACEMENT PORTAL
                    </button>
                </div>

                {/* Internship Portal Card */}
                <div
                    id="portal-internship"
                    className="linways-card"
                    onClick={() => navigate('/internship')}
                    style={{
                        cursor: 'pointer',
                        padding: '2.5rem',
                        transition: 'var(--transition)',
                        textAlign: 'left',
                    }}
                >
                    <div style={{
                        width: '60px', height: '60px', borderRadius: '4px',
                        background: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', marginBottom: '1.5rem',
                        color: 'white'
                    }}>
                        🎓
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '950', color: 'var(--primary)', marginBottom: '1rem', textTransform: 'uppercase' }}>
                        II. Internship Portal
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: '500', lineHeight: '1.6', marginBottom: '1.5rem', height: '80px' }}>
                        Manage mandatory and external internships, submit weekly progress updates, and secure multi-level faculty and institutional approvals.
                    </p>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem', flexWrap: 'wrap' }}>
                        {['Mandatory', 'External', 'Approvals'].map(tag => (
                            <span key={tag} className="badge" style={{ background: '#f1f5f9', color: '#003366', border: '1px solid #cbd5e1' }}>{tag}</span>
                        ))}
                    </div>
                    <button className="btn-primary" style={{ width: '100%' }}>
                        ENTER INTERNSHIP PORTAL
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PortalSelector;
