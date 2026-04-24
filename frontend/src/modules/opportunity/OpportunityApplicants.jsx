import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api';

const OpportunityApplicants = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [opportunity, setOpportunity] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchApplicants = async () => {
        try {
            const appRes = await api.get(`/application/opportunity/${id}/applicants`);
            setApplicants(appRes.data.data);
        } catch (err) {
            console.error('Error fetching applicants', err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch opportunity details, applicants and stats in parallel
                const [oppRes, appRes, statsRes] = await Promise.all([
                    api.get(`/opportunity/${id}`),
                    api.get(`/application/opportunity/${id}/applicants`),
                    api.get(`/application/opportunity/${id}/stats`)
                ]);

                setOpportunity(oppRes.data.data);
                setApplicants(appRes.data.data);
                setStats(statsRes.data.data);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch applicant insights.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleUpdateApplicant = async (appId, updateData) => {
        try {
            await api.put(`/application/status/${appId}`, updateData);
            // Refetch to ensure data consistency
            fetchApplicants();
            // Refresh stats too if needed
            const statsRes = await api.get(`/application/opportunity/${id}/stats`);
            setStats(statsRes.data.data);
        } catch (err) {
            console.error('Error updating applicant', err);
            alert('Failed to update application status.');
        }
    };

    const handleBulkShortlist = async () => {
        const topN = prompt('Enter the number of top candidates to shortlist:', '5');
        if (!topN || isNaN(topN)) return;

        try {
            await api.post('/application/bulk-shortlist', {
                opportunityId: id,
                topN: parseInt(topN)
            });
            alert(`Drafted shortlist for top ${topN} candidates!`);
            fetchApplicants();
        } catch (err) {
            console.error('Bulk shortlist error', err);
            alert('Failed to perform bulk shortlist.');
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <div className="loader">FETCHING INSIGHTS...</div>
        </div>
    );

    if (error || !opportunity) return (
        <div className="page-container" style={{ padding: '2rem' }}>
            <div className="alert alert-error">{error || 'Job profile not found.'}</div>
            <button onClick={() => navigate('/opportunities')} className="btn-primary" style={{ marginTop: '1rem' }}>Back to Opportunities</button>
        </div>
    );

    return (
        <div className="page-container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <button
                        onClick={() => navigate('/opportunities')}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                        ← BACK TO LISTINGS
                    </button>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: '950', color: 'var(--text-main)', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
                        APPLICANT INSIGHTS
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '600' }}>
                        {opportunity.title} | {opportunity.companyName}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ background: 'var(--bg-main)', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'right' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>DEADLINE</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-main)' }}>{new Date(opportunity.deadline).toLocaleDateString()}</p>
                    </div>
                    <button 
                        onClick={handleBulkShortlist}
                        className="btn-primary"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: 'none', borderRadius: '12px', padding: '0 1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        ✨ AUTO SHORTLIST TOP CANDIDATES
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="linways-card" style={{ padding: '1.5rem', borderLeft: '5px solid var(--primary)' }}>
                    <p className="card-title">Eligible Students</p>
                    <p className="card-value" style={{ color: 'var(--primary)' }}>{stats?.eligible}</p>
                </div>
                <div className="linways-card" style={{ padding: '1.5rem', borderLeft: '5px solid var(--success)' }}>
                    <p className="card-title">Total Applications</p>
                    <p className="card-value" style={{ color: 'var(--success)' }}>{stats?.applied}</p>
                </div>
                <div className="linways-card" style={{ padding: '1.5rem', borderLeft: '5px solid #f59e0b' }}>
                    <p className="card-title">Yet to Apply</p>
                    <p className="card-value" style={{ color: '#f59e0b' }}>{stats?.yetToApply}</p>
                </div>
                <div className="linways-card" style={{ padding: '1.5rem', borderLeft: '5px solid #64748b' }}>
                    <p className="card-title">Total Enrolled</p>
                    <p className="card-value" style={{ color: '#64748b' }}>{stats?.totalEnrolled}</p>
                </div>
            </div>

            {/* Applicants Table */}
            <div className="linways-card">
                <div className="linways-card-header">
                    <h4>REGISTERED CANDIDATES ({applicants.length})</h4>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>STUDENT NAME</th>
                                <th>ROLL NUMBER</th>
                                <th>MATCH % ⇳</th>
                                <th>DEPARTMENT</th>
                                <th>YEAR</th>
                                <th>APPLIED AT</th>
                                <th>DOCS</th>
                                <th>ROUND</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applicants.length === 0 ? (
                                <tr>
                                    <td colSpan="10" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                                        No applications received for this role yet.
                                    </td>
                                </tr>
                            ) : (
                                applicants.map(app => (
                                    <tr key={app._id}>
                                        <td>
                                            <div style={{ fontWeight: '800', color: 'var(--text-main)' }}>{app.studentId?.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.studentId?.userId?.email}</div>
                                        </td>
                                        <td style={{ fontWeight: '700' }}>{app.studentId?.rollNumber}</td>
                                        <td>
                                            <div style={{ 
                                                padding: '4px 8px', borderRadius: '6px', 
                                                background: app.matchScore > 70 ? '#d1fae5' : app.matchScore >= 40 ? '#fef3c7' : '#fee2e2',
                                                color: app.matchScore > 70 ? '#059669' : app.matchScore >= 40 ? '#d97706' : '#dc2626',
                                                fontSize: '0.75rem', fontWeight: '900', display: 'inline-block'
                                            }}>
                                                {app.matchScore}%
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: '600' }}>{app.studentId?.department}</td>
                                        <td>Year {app.studentId?.year}</td>
                                        <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                {app.studentId?.linkedIn && (
                                                    <a href={app.studentId.linkedIn} target="_blank" rel="noreferrer" style={{ width: '24px', height: '24px', background: '#0077b5', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none', fontSize: '0.6rem', fontWeight: '900' }}>in</a>
                                                )}
                                                {app.studentId?.github && (
                                                    <a href={app.studentId.github} target="_blank" rel="noreferrer" style={{ width: '24px', height: '24px', background: '#24292e', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none', fontSize: '0.6rem', fontWeight: '900' }}>git</a>
                                                )}
                                                {app.studentId?.resumeURL ? (
                                                    <a
                                                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1'}${app.studentId.resumeURL.startsWith('/') ? '' : '/'}${app.studentId.resumeURL.replace('/api/v1', '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title="View Resume"
                                                        style={{ color: 'var(--primary)', fontWeight: '800', textDecoration: 'none', fontSize: '0.7rem' }}
                                                    >
                                                        📄 RESUME
                                                    </a>
                                                ) : (
                                                    <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>NO DOCS</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <select
                                                value={app.currentRound || 'Applied'}
                                                onChange={(e) => handleUpdateApplicant(app._id, { currentRound: e.target.value })}
                                                style={{
                                                    padding: '0.4rem',
                                                    borderRadius: '6px',
                                                    border: '1px solid var(--border-color)',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '700',
                                                    background: '#f8fafc',
                                                    color: 'var(--text-main)',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="Applied">Applied</option>
                                                {opportunity.hiringWorkflow?.split('\n').filter(s => s.trim()).map((step, idx) => (
                                                    <option key={idx} value={step.trim()}>{step.trim()}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                        <span className={`badge ${app.status?.toUpperCase() === 'SELECTED' ? 'badge-selected' :
                                                app.status?.toUpperCase() === 'SHORTLISTED' ? 'badge-shortlisted' :
                                                    app.status?.toUpperCase() === 'REJECTED' ? 'badge-rejected' : 'badge-applied'
                                                }`}
                                                style={{ fontSize: '0.65rem', padding: '4px 8px' }}
                                            >
                                                {app.status?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                <button
                                                    onClick={() => handleUpdateApplicant(app._id, { status: 'SHORTLISTED' })}
                                                    title="Shortlist"
                                                    style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    📜
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateApplicant(app._id, { status: 'SELECTED' })}
                                                    title="Select / Hire"
                                                    style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#047857', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    ✅
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateApplicant(app._id, { status: 'REJECTED' })}
                                                    title="Reject"
                                                    style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    ❌
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OpportunityApplicants;
