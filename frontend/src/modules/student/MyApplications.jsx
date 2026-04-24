import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import TimelineComponent from '../../components/TimelineComponent';

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [approvals, setApprovals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [offerLetterURL, setOfferLetterURL] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showTimeline, setShowTimeline] = useState(false);
    const [timelineData, setTimelineData] = useState([]);
    const [fetchingTimeline, setFetchingTimeline] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const [appRes, approvalRes] = await Promise.all([
                api.get('/application/my'),
                api.get('/approval/my')
            ]);
            setApplications(appRes.data.data);
            setApprovals(approvalRes.data.data);
        } catch (err) {
            setError('Failed to fetch your applications and approvals.');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestApproval = (app) => {
        setSelectedApp(app);
        setShowModal(true);
    };

    const handleViewTimeline = async (app) => {
        setSelectedApp(app);
        setShowTimeline(true);
        setFetchingTimeline(true);
        try {
            const res = await api.get(`/application/${app._id}/timeline`);
            setTimelineData(res.data.data);
        } catch (err) {
            console.error('Error fetching timeline', err);
            alert('Failed to load application timeline.');
            setShowTimeline(false);
        } finally {
            setFetchingTimeline(false);
        }
    };

    const submitApprovalRequest = async () => {
        if (!offerLetterURL) return alert('Please provide the offer letter URL');
        setSubmitting(true);
        try {
            await api.post('/approval/request', {
                applicationId: selectedApp._id,
                offerLetterURL
            });
            alert('Approval request submitted!');
            setShowModal(false);
            setOfferLetterURL('');
            fetchApplications();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <div className="loader">Loading applications...</div>
        </div>
    );

    return (
        <div className="page-container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2.5rem', borderBottom: '2px solid var(--primary)', paddingBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '0.25rem', letterSpacing: '-0.5px', textTransform: 'uppercase' }}>
                    MY OFFICIAL SUBMISSIONS
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Track your professional recruitment lifecycle and institutional engagement status.</p>
            </header>

            {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem', fontWeight: '700' }}>{error}</div>}

            <div className="linways-card">
                <div className="linways-card-header">
                    <h4>APPLICATION PIPELINE</h4>
                </div>
                {applications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.2 }}>📫</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)' }}>NO ACTIVE SUBMISSIONS</h3>
                        <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Your application queue is currently empty.</p>
                        <a href="/opportunities" className="btn-primary" style={{ display: 'inline-block', marginTop: '2.5rem', textDecoration: 'none', padding: '0.8rem 2rem', fontWeight: '800' }}>BROWSE LISTINGS</a>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>POSITION / ROLE</th>
                                    <th>ORGANIZATION</th>
                                    <th>STATUS</th>
                                    <th>SUBMISSION DATE</th>
                                    <th>ACTION/APPROVAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((app) => (
                                    <tr key={app._id}>
                                        <td><div style={{ fontWeight: '800', color: 'var(--text-main)' }}>{app.opportunityId?.title?.toUpperCase()}</div></td>
                                        <td><div style={{ fontWeight: '600', color: 'var(--primary)', letterSpacing: '0.5px' }}>{app.opportunityId?.companyName?.toUpperCase()}</div></td>
                                        <td>
                                            {(() => {
                                                const s = (app.status || '').toUpperCase();
                                                const badgeClass = s === 'SELECTED' ? 'badge-selected' :
                                                                  s === 'SHORTLISTED' ? 'badge-shortlisted' :
                                                                  s === 'REJECTED' ? 'badge-rejected' : 'badge-applied';
                                                return (
                                                    <span className={`badge ${badgeClass}`} style={{
                                                        fontWeight: '900',
                                                        letterSpacing: '0.5px',
                                                        padding: '6px 12px',
                                                        borderRadius: '8px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}>
                                                        {s === 'SELECTED' && '🏆 '}
                                                        {s === 'SHORTLISTED' && '⭐ '}
                                                        {s === 'REJECTED' && '❌ '}
                                                        {s === 'APPLIED' && '📄 '}
                                                        {app.status?.toUpperCase()}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td style={{ fontWeight: '600', color: 'var(--text-muted)' }}>{new Date(app.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <button 
                                                    onClick={() => handleViewTimeline(app)}
                                                    style={{ 
                                                        background: 'none', border: '1px solid var(--primary)', color: 'var(--primary)', 
                                                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '900', cursor: 'pointer'
                                                    }}
                                                >
                                                    TIMELINE
                                                </button>
                                                {(() => {
                                                    const hasApproval = approvals.find(a => a.applicationId === app._id || a.applicationId?._id === app._id);
                                                    const isSelected = (app.status || '').toUpperCase() === 'SELECTED';
                                                    const isInternship = (app.type || '').toUpperCase() === 'INTERNSHIP';

                                                    if (hasApproval) {
                                                        return (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                <span style={{ fontSize: '0.65rem', fontWeight: '900', color: 'var(--primary)', background: '#eff6ff', padding: '4px 8px', borderRadius: '4px' }}>
                                                                    APPROVAL: {hasApproval.status.replace('_', ' ')}
                                                                </span>
                                                            </div>
                                                        );
                                                    }

                                                    if (isSelected && isInternship) {
                                                        return (
                                                            <button 
                                                                className="btn-primary" 
                                                                onClick={() => handleRequestApproval(app)}
                                                                style={{ fontSize: '0.65rem', padding: '6px 12px', fontWeight: '900', borderRadius: '6px' }}
                                                            >
                                                                REQUEST APPROVAL
                                                            </button>
                                                        );
                                                    }

                                                    return null;
                                                })()}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Timeline Modal */}
            {showTimeline && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="linways-card" style={{ maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div className="linways-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: '#f8fafc' }}>
                            <h4 style={{ fontWeight: '1000', fontSize: '1rem' }}>APPLICATION LIFECYCLE</h4>
                            <button onClick={() => setShowTimeline(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: '1000', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                        </div>
                        <div style={{ padding: '2rem' }}>
                            <div style={{ marginBottom: '2rem', padding: '1rem', background: '#eff6ff', borderRadius: '12px' }}>
                                <p style={{ fontWeight: '1000', color: 'var(--primary)', fontSize: '1rem' }}>{selectedApp?.opportunityId?.companyName?.toUpperCase()}</p>
                                <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>{selectedApp?.opportunityId?.title} • {selectedApp?.type?.toUpperCase()}</p>
                            </div>
                            {fetchingTimeline ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading journey...</div>
                            ) : (
                                <TimelineComponent history={timelineData} />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Simple Modal for Requesting Approval */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="linways-card" style={{ maxWidth: '500px', width: '90%', padding: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '1rem' }}>REQUEST INTERNSHIP APPROVAL</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            Please provide the link to your official offer letter for <strong>{selectedApp?.opportunityId?.companyName || 'this internship'}</strong>.
                        </p>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '800', display: 'block', marginBottom: '0.5rem' }}>OFFER LETTER URL (Google Drive / Dropbox)</label>
                            <input 
                                type="text" 
                                placeholder="https://..."
                                value={offerLetterURL}
                                onChange={(e) => setOfferLetterURL(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#F8FAFC' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className="btn-outline" onClick={() => setShowModal(false)} style={{ padding: '0.8rem 1.5rem' }}>CANCEL</button>
                            <button className="btn-primary" onClick={submitApprovalRequest} disabled={submitting} style={{ padding: '0.8rem 1.5rem' }}>
                                {submitting ? 'SUBMITTING...' : 'SUBMIT REQUEST'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyApplications;
