import React, { useState, useEffect } from 'react';
import api from '../api/api';
import TimelineComponent from './TimelineComponent';

/**
 * Reusable Dashboard for higher-level internship approvals (Coordinator, HOD, Dean)
 */
const ApprovalRow = ({ req, updatingId, handleAction, role }) => {
    const [remarks, setRemarks] = useState('');
    const company = req.applicationId?.companyName || req.opportunityId?.companyName || 'N/A';
    const roleName = req.applicationId?.role || req.opportunityId?.title || 'N/A';
    const source = req.applicationId?.internshipSource || 'EXTERNAL';
    const [showTimeline, setShowTimeline] = useState(false);

    const levels = ['FACULTY', 'COORDINATOR', 'HOD', 'DEAN'];
    const currentRoleIndex = levels.indexOf(role.toUpperCase());

    return (
        <tr style={{ transition: 'background 0.2s' }}>
            <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div>
                        <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9rem' }}>{req.studentId?.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>{req.studentId?.rollNumber}</div>
                    </div>
                    <button 
                        onClick={() => setShowTimeline(true)}
                        style={{ background: '#f1f5f9', border: 'none', color: 'var(--primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: '800', cursor: 'pointer' }}
                    >
                        JOURNEY
                    </button>
                </div>

                {showTimeline && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(3px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <div className="linways-card" style={{ maxWidth: '500px', width: '90%', maxHeight: '70vh', overflowY: 'auto', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: '900' }}>AUDIT TRAIL: {req.studentId?.name.toUpperCase()}</h4>
                                <button onClick={() => setShowTimeline(false)} style={{ background: 'none', border: 'none', fontWeight: '900', cursor: 'pointer' }}>✕</button>
                            </div>
                            <TimelineComponent history={req.history} />
                        </div>
                    </div>
                )}
            </td>
            <td>
                <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.85rem' }}>{company.toUpperCase()}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-main)' }}>{roleName}</div>
            </td>
            <td>
                <span style={{
                    fontSize: '0.65rem', fontWeight: '800', padding: '3px 8px',
                    borderRadius: '4px', background: source === 'External' ? '#fef3c7' : '#dbeafe',
                    color: source === 'External' ? '#d97706' : '#2563eb',
                }}>
                    {source.toUpperCase()}
                </span>
            </td>
            <td>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {levels.map((level, idx) => {
                        const statusMap = {
                            'FACULTY': 'FACULTY_APPROVED',
                            'COORDINATOR': 'COORDINATOR_APPROVED',
                            'HOD': 'HOD_APPROVED',
                            'DEAN': 'DEAN_APPROVED'
                        };
                        const targetStatusForCompletion = statusMap[level];
                        const isApproved = req.history.some(h => h.status === targetStatusForCompletion) || (level === 'DEAN' && req.status === 'DEAN_APPROVED');
                        const isCurrent = (idx === 0 && req.status === 'PENDING_FACULTY' && level === 'FACULTY') || 
                                          (idx > 0 && req.status === statusMap[levels[idx-1]] && level === levels[idx]);

                        return (
                            <div key={level} style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{
                                    fontSize: '0.62rem', fontWeight: '900', padding: '4px 10px',
                                    borderRadius: '4px', letterSpacing: '0.5px',
                                    background: isApproved ? '#dcfce7' : isCurrent ? '#fef3c7' : '#f1f5f9',
                                    color: isApproved ? '#166534' : isCurrent ? '#92400e' : '#64748b',
                                    border: isCurrent ? '1.5px solid #d97706' : isApproved ? '1.5px solid #166534' : '1px solid #e2e8f0',
                                    textTransform: 'uppercase'
                                }}>
                                    {level === 'FACULTY' ? 'MENTOR' : level}{isApproved ? ' ✓' : ''}
                                </span>
                                {idx < levels.length - 1 && <span style={{ margin: '0 4px', color: '#cbd5e1', fontWeight: '900' }}>→</span>}
                            </div>
                        );
                    })}
                </div>
            </td>
            <td>
                {req.offerLetterURL ? (
                    <a href={req.offerLetterURL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '0.75rem', textDecoration: 'none', borderBottom: '1.5px solid var(--primary)' }}>
                        VIEW DOC →
                    </a>
                ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic' }}>No document</span>
                )}
            </td>
            <td>
                <input 
                    type="text" 
                    placeholder="Add approval remarks..." 
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    style={{ 
                        width: '100%', fontSize: '0.75rem', padding: '0.5rem', 
                        borderRadius: '8px', border: '1px solid #e2e8f0',
                        background: '#f8fafc', fontWeight: '500'
                    }}
                />
            </td>
            <td>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button 
                        className="btn-primary"
                        disabled={updatingId === req._id}
                        onClick={() => handleAction(req._id, 'approve', remarks)}
                        style={{ padding: '0.45rem 0.9rem', fontSize: '0.72rem', fontWeight: '850' }}
                    >
                        APPROVE
                    </button>
                    <button 
                        className="btn-outline"
                        disabled={updatingId === req._id}
                        onClick={() => handleAction(req._id, 'reject', remarks)}
                        style={{ 
                            padding: '0.45rem 0.9rem', fontSize: '0.72rem', fontWeight: '850', 
                            borderColor: '#ef4444', color: '#ef4444' 
                        }}
                    >
                        REJECT
                    </button>
                </div>
            </td>
        </tr>
    );
};

const RoleApprovalDashboard = ({ 
    role, 
    title, 
    subtitle, 
    isHub = false, 
    hubPending = null, 
    onAction = null 
}) => {
    const [requests, setRequests] = useState(isHub ? (hubPending || []) : []);
    const [loading, setLoading] = useState(isHub ? false : true);
    const [updatingId, setUpdatingId] = useState(null);
    const [stats, setStats] = useState({ 
        pending: isHub ? (hubPending?.length || 0) : 0, 
        urgent: 0 
    });

    const rolePath = role.toLowerCase();

    useEffect(() => {
        if (isHub) {
            setRequests(hubPending || []);
            setStats({
                pending: hubPending?.length || 0,
                urgent: (hubPending || []).filter(r => new Date(r.updatedAt || r.appliedAt) < new Date(Date.now() - 48 * 60 * 60 * 1000)).length,
            });
        }
    }, [hubPending, isHub]);

    const fetchRequests = async () => {
        if (isHub) return;
        try {
            const res = await api.get(`/approval/pending`, { params: { role } });
            const data = res.data.data || [];
            setRequests(data);
            setStats({
                pending: data.length,
                urgent: data.filter(r => new Date(r.updatedAt || r.createdAt) < new Date(Date.now() - 48 * 60 * 60 * 1000)).length,
            });
        } catch (err) {
            console.error(`Error fetching ${role} requests:`, err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [role, isHub]);

    const handleAction = async (requestId, action, remarks = '') => {
        setUpdatingId(requestId);
        try {
            if (isHub && onAction) {
                await onAction(requestId, action, remarks, rolePath);
            } else {
                const act = action === 'approve' ? 'APPROVE' : 'REJECT';
                await api.put(`/approval/${requestId}/status`, { action: act, remarks });
                setRequests(prev => prev.filter(req => req._id !== requestId));
                setStats(prev => ({ ...prev, pending: prev.pending - 1 }));
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || `Failed to ${action} internship`;
            console.error(`Error ${action}ing internship:`, err);
            alert(errorMsg);
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
            <div className="loader">Synchronizing {role.toUpperCase()} Pipeline...</div>
        </div>
    );

    return (
        <div className={isHub ? "" : "page-container"} style={isHub ? {} : { padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {!isHub && (
                <header style={{ marginBottom: '2.5rem', borderBottom: '2px solid var(--primary)', paddingBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ 
                            background: 'var(--primary)', color: '#fff', padding: '4px 12px', 
                            borderRadius: '4px', fontSize: '0.65rem', fontWeight: '850', letterSpacing: '1px' 
                        }}>ADMINISTRATIVE OVERSIGHT</span>
                    </div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '0.25rem', letterSpacing: '-0.5px', textTransform: 'uppercase' }}>
                        {title}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>{subtitle}</p>
                </header>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="linways-card" style={{ borderTop: '4px solid #dc2626' }}>
                    <div className="linways-card-header"><h4>{isHub ? `${role.toUpperCase()} PENDING` : "PENDING REVIEWS"}</h4></div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '950', color: '#dc2626' }}>{stats.pending}</div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: '700' }}>{isHub ? "DEPARTMENTAL QUEUE" : "SIGNATURES REQUIRED"}</p>
                </div>
                <div className="linways-card" style={{ borderTop: '4px solid #ef4444' }}>
                    <div className="linways-card-header"><h4>URGENT ACTION</h4></div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '950', color: '#ef4444' }}>{stats.urgent}</div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: '700' }}>WAITING &gt; 48 HOURS</p>
                </div>
                <div className="linways-card" style={{ borderTop: '4px solid var(--primary)' }}>
                    <div className="linways-card-header"><h4>PIPELINE STATUS</h4></div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '950', color: 'var(--primary)', marginTop: '0.5rem' }}>
                        {stats.pending > 0 ? 'SIGNATURES PENDING' : 'CLEAR'}
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.8rem', fontWeight: '700' }}>OPERATIONAL VERIFICATION</p>
                </div>
            </div>

            <div className="linways-card" style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' }}>
                <div className="linways-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--text-main)' }}>{isHub ? `${role.toUpperCase()} APPROVAL PIPELINE` : "INTERNSHIP APPROVAL PIPELINE"}</h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800', background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px' }}>
                        {requests.length} REQUESTS AWAITING
                    </span>
                </div>
                <div className="table-container" style={{ padding: '0 1rem 1rem 1rem' }}>
                    <table style={{ borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ padding: '1rem', borderRadius: '8px 0 0 8px' }}>STUDENT</th>
                                <th>COMPANY & ROLE</th>
                                <th>TYPE</th>
                                <th>WORKFLOW PROGRESS</th>
                                <th>DOCUMENT</th>
                                <th>REMARKS</th>
                                <th style={{ borderRadius: '0 8px 8px 0' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <ApprovalRow 
                                    key={req._id} 
                                    req={req} 
                                    updatingId={updatingId} 
                                    handleAction={handleAction} 
                                    role={role}
                                />
                            ))}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎉</div>
                                        <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>Workflow Cleared!</div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>No pending internship requests for your level at this time.</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RoleApprovalDashboard;
