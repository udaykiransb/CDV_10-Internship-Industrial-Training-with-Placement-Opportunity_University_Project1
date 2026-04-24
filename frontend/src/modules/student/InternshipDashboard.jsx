import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import TimelineComponent from '../../components/TimelineComponent';
import ApplicationJourney from './ApplicationJourney';
import NOCViewer from '../documents/NOCViewer';
import CompletionLetterViewer from '../../components/CompletionLetterViewer';

// ── Internship status badge ──────────────────────────────────────────────────
const statusBadge = (status) => {
    const s = status?.toUpperCase() || 'APPLIED';
    const map = {
        'PENDING_APPROVAL': { background: '#fef3c7', color: '#d97706' },
        'APPROVED': { background: '#d1fae5', color: '#059669' },
        'IN_PROGRESS': { background: '#dbeafe', color: '#2563eb' },
        'COMPLETED': { background: '#d1fae5', color: '#047857' },
        'REJECTED': { background: '#fee2e2', color: '#dc2626' },
        'APPLIED': { background: '#e2e8f0', color: '#475569' },
        'SELECTED': { background: '#eff6ff', color: '#2563eb' },
    };
    return map[s] || map['APPLIED'];
};

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, title, value, color }) => (
    <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <p style={{ fontSize: '0.7rem', fontWeight: '850', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>{title}</p>
                <div style={{ fontSize: '2.25rem', fontWeight: '900', color: 'var(--primary)', lineHeight: '1' }}>{value}</div>
            </div>
            <div style={{ width: '45px', height: '45px', borderRadius: '4px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', border: '1px solid var(--border-color)' }}>{icon}</div>
        </div>
    </div>
);

const InternshipDashboard = () => {
    const [internships, setInternships] = useState([]);
    const [availableOpps, setAvailableOpps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [progressText, setProgressText] = useState('');
    const [progressModal, setProgressModal] = useState({ show: false, appId: null });
    const [approvalModal, setApprovalModal] = useState({ show: false, appId: null });
    const [offerLetterURL, setOfferLetterURL] = useState('');
    const [approvals, setApprovals] = useState([]);
    const [historyModal, setHistoryModal] = useState({ show: false, history: [] });
    const [alertModal, setAlertModal] = useState({ show: false, success: true, message: '' });
    const [nocModal, setNocModal] = useState({ show: false, data: null });
    const [certModal, setCertModal] = useState({ show: false, data: null });
    const { user } = useAuth();
    const navigate = useNavigate();

    // Form state for external internship
    const [formData, setFormData] = useState({
        companyName: '',
        role: '',
        duration: '',
        stipend: '',
        offerLetterURL: '',
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        await Promise.all([
            fetchInternships(),
            fetchAvailableOpportunities(),
            fetchApprovals()
        ]);
        setLoading(false);
    };

    const fetchApprovals = async () => {
        try {
            const res = await api.get('/approval/my');
            setApprovals(res.data.data || []);
        } catch (err) {
            console.error('Error fetching approvals:', err);
        }
    };

    const fetchInternships = async () => {
        try {
            const res = await api.get('/application/internship/my');
            setInternships(res.data.data || []);
        } catch (err) {
            console.error('Error fetching internships:', err);
            setInternships([]);
        }
    };

    const fetchAvailableOpportunities = async () => {
        try {
            const res = await api.get('/opportunity/student-feed');
            // Filter for internship type (case insensitive to be safe)
            const opps = (res.data.data || []).filter(o => 
                (o.type || '').toUpperCase() === 'INTERNSHIP'
            );
            setAvailableOpps(opps);
        } catch (err) {
            console.error('Error fetching available opportunities:', err);
            setAvailableOpps([]);
        }
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmitExternal = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/application/internship/submit-external', formData);
            setAlertModal({ show: true, success: true, message: 'External internship submitted for faculty approval!' });
            setShowForm(false);
            setFormData({ companyName: '', role: '', duration: '', stipend: '', offerLetterURL: '', startDate: '', endDate: '' });
            fetchInternships();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Submission failed. Please try again.';
            setAlertModal({ show: true, success: false, message: errorMsg });
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddProgress = async () => {
        if (!progressText.trim()) return;
        try {
            await api.post(`/application/internship/progress/${progressModal.appId}`, { updateText: progressText });
            setAlertModal({ show: true, success: true, message: 'Progress update added!' });
            setProgressModal({ show: false, appId: null });
            setProgressText('');
            fetchInternships();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to add progress update.';
            setAlertModal({ show: true, success: false, message: errorMsg });
        }
    };

    const handleRequestApproval = async () => {
        if (!offerLetterURL.trim()) return;
        try {
            await api.post('/approval/request', { 
                applicationId: approvalModal.appId, 
                offerLetterURL 
            });
            setAlertModal({ show: true, success: true, message: 'Approval request submitted to Faculty!' });
            setApprovalModal({ show: false, appId: null });
            setOfferLetterURL('');
            fetchApprovals();
            fetchInternships(); // Refresh internships to show new level
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to submit approval request.';
            setAlertModal({ show: true, success: false, message: errorMsg });
        }
    };

    const handleViewNOC = async (appId) => {
        try {
            const res = await api.get(`/document/noc/${appId}`);
            setNocModal({ show: true, data: res.data.data });
        } catch (err) {
            setAlertModal({ show: true, success: false, message: 'Failed to retrieve official documentation.' });
        }
    };

    // Stats
    const totalInternships = internships.length;
    const pendingCount = internships.filter(i => {
        const s = (i.internshipStatus || i.status || '').toUpperCase();
        return s === 'PENDING_APPROVAL';
    }).length;
    const activeCount = internships.filter(i => {
        const s = (i.internshipStatus || i.status || '').toUpperCase();
        return ['APPROVED', 'IN_PROGRESS'].includes(s);
    }).length;
    const completedCount = internships.filter(i => {
        const s = (i.internshipStatus || i.status || '').toUpperCase();
        return s === 'COMPLETED';
    }).length;

    if (loading) return (
        <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div className="loader">Loading Internship Data...</div>
        </div>
    );

    return (
        <div className="page-container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', borderBottom: '2px solid var(--primary)', paddingBottom: '1.5rem' }}>
                <div>
                    <button 
                        onClick={() => navigate('/')} 
                        className="btn-outline"
                        style={{ padding: '6px 14px', fontSize: '0.72rem', marginBottom: '1.5rem', fontWeight: '850' }}
                    >
                        ← RETURN TO SECTOR SELECTION
                    </button>
                    <h1 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-0.5px', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        OFFICIAL INTERNSHIP GATEWAY
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontWeight: '800', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px' }}>INSTITUTIONAL ACADEMIC & EXTERNAL ENGAGEMENT TRACKING</p>
                </div>
                <button
                    id="btn-submit-external"
                    className="btn-primary"
                    style={{ padding: '0.8rem 1.5rem', fontSize: '0.82rem', fontWeight: '850' }}
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? '✕ ABANDON SUBMISSION' : '➕ REPORT EXTERNAL ENGAGEMENT'}
                </button>
            </div>

            {/* ══ Stats Cards ══════════════════════════════════════════════════ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard icon="🎓" title="Total Internships" value={totalInternships} color="#0891b2" />
                <StatCard icon="⏳" title="Pending Approval" value={pendingCount} color="#d97706" />
                <StatCard icon="🚀" title="Active" value={activeCount} color="#2563eb" />
                <StatCard icon="✅" title="Completed" value={completedCount} color="#059669" />
            </div>

            {/* ══ AI Match Suggestions ════════════════════════════════════════ */}
            <div className="linways-card" style={{ marginBottom: '2rem', borderLeft: '6px solid var(--primary)' }}>
                <div className="linways-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>✨</span>
                        <div>
                            <h4 style={{ margin: 0 }}>AI SKILL MATCH SUGGESTIONS</h4>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>Personalized recommendations based on your profile skills</p>
                        </div>
                    </div>
                </div>
                
                {availableOpps.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No recommended internships found matching your profile.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem', padding: '1rem' }}>
                        {availableOpps.slice(0, 3).map(opp => {
                            const labelColor = opp.matchPercentage > 70 ? '#059669' : opp.matchPercentage >= 40 ? '#d97706' : '#dc2626';
                            const labelBg = opp.matchPercentage > 70 ? '#d1fae5' : opp.matchPercentage >= 40 ? '#fef3c7' : '#fee2e2';

                            return (
                                <div key={opp._id} style={{ 
                                    background: '#f8fafc', borderRadius: '16px', padding: '1.25rem', 
                                    border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem' 
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h5 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>{opp.title}</h5>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '700' }}>{opp.companyName?.toUpperCase()}</p>
                                        </div>
                                        <div style={{ 
                                            padding: '4px 10px', borderRadius: '8px', background: labelBg, 
                                            color: labelColor, fontSize: '0.7rem', fontWeight: '900', textAlign: 'center'
                                        }}>
                                            {(opp.matchLabel || 'Match').toUpperCase()}<br/>
                                            {opp.matchPercentage}% MATCH
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                        {opp.requiredSkills?.slice(0, 4).map(skill => (
                                            <span key={skill} style={{ fontSize: '0.65rem', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>{skill}</span>
                                        ))}
                                    </div>

                                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                                            Deadline: {new Date(opp.deadline).toLocaleDateString()}
                                        </span>
                                        <button 
                                            className="btn-primary" 
                                            style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', borderRadius: '8px' }}
                                            onClick={() => navigate(`/opportunities/${opp._id}`)}
                                        >
                                            VIEW DETAILS
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {availableOpps.length > 3 && (
                    <div style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
                        <button 
                            onClick={() => navigate('/opportunities')} 
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                            VIEW ALL MATCHING OPPORTUNITIES →
                        </button>
                    </div>
                )}
            </div>

            {/* ══ Submit External Internship Form ═════════════════════════════ */}
            {showForm && (
                <div className="linways-card" style={{ marginBottom: '2rem', borderTop: '4px solid #0891b2' }}>
                    <div className="linways-card-header">
                        <h4>SUBMIT EXTERNAL INTERNSHIP</h4>
                    </div>
                    <form onSubmit={handleSubmitExternal} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '0.5rem 0' }}>
                        <div>
                            <label style={labelStyle}>Company Name *</label>
                            <input name="companyName" value={formData.companyName} onChange={handleFormChange} required style={inputStyle} placeholder="e.g. Google India" />
                        </div>
                        <div>
                            <label style={labelStyle}>Role *</label>
                            <input name="role" value={formData.role} onChange={handleFormChange} required style={inputStyle} placeholder="e.g. Software Engineering Intern" />
                        </div>
                        <div>
                            <label style={labelStyle}>Duration *</label>
                            <input name="duration" value={formData.duration} onChange={handleFormChange} required style={inputStyle} placeholder="e.g. 3 months" />
                        </div>
                        <div>
                            <label style={labelStyle}>Stipend</label>
                            <input name="stipend" value={formData.stipend} onChange={handleFormChange} style={inputStyle} placeholder="e.g. ₹25,000/month" />
                        </div>
                        <div>
                            <label style={labelStyle}>Offer Letter URL</label>
                            <input name="offerLetterURL" value={formData.offerLetterURL} onChange={handleFormChange} style={inputStyle} placeholder="https://..." />
                        </div>
                        <div>
                            <label style={labelStyle}>Start Date</label>
                            <input name="startDate" type="date" value={formData.startDate} onChange={handleFormChange} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>End Date</label>
                            <input name="endDate" type="date" value={formData.endDate} onChange={handleFormChange} style={inputStyle} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <button type="submit" className="btn-primary" disabled={submitting} style={{ width: '100%', padding: '0.75rem', fontWeight: '900' }}>
                                {submitting ? 'PROCESSING...' : 'TRANSMIT FOR APPROVAL'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ══ My Internships Table ════════════════════════════════════════ */}
            <div className="linways-card" style={{ marginBottom: '2rem' }}>
                <div className="linways-card-header">
                    <h4>MY INTERNSHIPS</h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>TOTAL {internships.length}</span>
                </div>

                {internships.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.2 }}>🎓</div>
                        <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>No internships yet. Apply to college internships or submit an external internship.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>COMPANY</th>
                                    <th>ROLE</th>
                                    <th>TYPE</th>
                                    <th>DURATION</th>
                                    <th>STATUS</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {internships.map(intern => {
                                    const company = intern.companyName || intern.opportunityId?.companyName || 'N/A';
                                    const role = intern.role || intern.opportunityId?.title || 'N/A';
                                    const currentStatus = (intern.internshipStatus || intern.status || 'APPLIED').toUpperCase();
                                    const badge = statusBadge(currentStatus);
                                    const source = intern.internshipSource || 'College';
                                    const canAddProgress = ['APPROVED', 'IN_PROGRESS'].includes(currentStatus);

                                    return (
                                        <tr key={intern._id}>
                                            <td><strong style={{ color: 'var(--primary)' }}>{company.toUpperCase()}</strong></td>
                                            <td><span style={{ fontWeight: '700' }}>{role}</span></td>
                                            <td>
                                                <span style={{
                                                    fontSize: '0.65rem', fontWeight: '800', padding: '3px 8px',
                                                    borderRadius: '4px', letterSpacing: '0.5px',
                                                    background: source.toUpperCase() === 'EXTERNAL' ? '#fef3c7' : '#dbeafe',
                                                    color: source.toUpperCase() === 'EXTERNAL' ? '#d97706' : '#2563eb',
                                                }}>{source.toUpperCase()}</span>
                                            </td>
                                            <td style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem' }}>
                                                {intern.duration || 'N/A'}
                                            </td>
                                            <td>
                                                <span style={{
                                                    ...badge, fontSize: '0.7rem', fontWeight: '800',
                                                    padding: '4px 12px', borderRadius: '999px',
                                                    display: 'inline-block', letterSpacing: '0.5px',
                                                }}>{currentStatus?.toUpperCase()}</span>
                                            </td>
                                            <td style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                                <button
                                                    onClick={() => setHistoryModal({ show: true, history: intern.history || [] })}
                                                    style={{ background: '#f1f5f9', border: 'none', color: 'var(--primary)', padding: '5px 10px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '900', cursor: 'pointer' }}
                                                >
                                                    JOURNEY
                                                </button>
                                                {intern.opportunityId && (
                                                    <button
                                                        className="btn-primary"
                                                        style={{ padding: '0.35rem 0.8rem', fontSize: '0.7rem', fontWeight: '800', borderRadius: '8px', background: '#334155' }}
                                                        onClick={() => navigate(`/opportunities/${intern.opportunityId?._id || intern.opportunityId}`)}
                                                    >
                                                        DETAILS
                                                    </button>
                                                )}
                                                {canAddProgress && (
                                                    <button
                                                        className="btn-primary"
                                                        style={{ padding: '0.35rem 0.8rem', fontSize: '0.7rem', fontWeight: '800', borderRadius: '8px' }}
                                                        onClick={() => setProgressModal({ show: true, appId: intern._id })}
                                                    >
                                                        + PROGRESS
                                                    </button>
                                                )}
                                                {currentStatus === 'SELECTED' && !approvals.some(a => a.applicationId?._id === intern._id) && (
                                                    <button
                                                        className="btn-primary"
                                                        style={{ padding: '0.35rem 0.8rem', fontSize: '0.7rem', fontWeight: '800', borderRadius: '8px', background: '#059669' }}
                                                        onClick={() => setApprovalModal({ show: true, appId: intern._id })}
                                                    >
                                                        REQUEST APPROVAL
                                                    </button>
                                                )}
                                                {(currentStatus === 'COMPLETED' || intern.finalStatus?.toUpperCase() === 'APPROVED') && (
                                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                        <button
                                                            className="btn-primary"
                                                            style={{ padding: '0.35rem 0.8rem', fontSize: '0.7rem', fontWeight: '800', borderRadius: '8px', background: 'var(--primary)' }}
                                                            onClick={() => handleViewNOC(intern._id)}
                                                        >
                                                            📜 NOC
                                                        </button>
                                                        {currentStatus === 'COMPLETED' && (
                                                            <button
                                                                className="btn-primary"
                                                                style={{ padding: '0.35rem 0.8rem', fontSize: '0.7rem', fontWeight: '800', borderRadius: '8px', background: '#059669' }}
                                                                onClick={() => setCertModal({
                                                                    show: true,
                                                                    data: {
                                                                        studentName: user.name,
                                                                        rollNumber: profile?.rollNumber || 'N/A',
                                                                        department: profile?.department || 'N/A',
                                                                        companyName: company,
                                                                        role: role,
                                                                        duration: intern.duration,
                                                                        startDate: intern.startDate,
                                                                        endDate: intern.endDate
                                                                    }
                                                                })}
                                                            >
                                                                🏆 CERTIFICATE
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ══ Progress Logs ═══════════════════════════════════════════════ */}
            {internships.some(i => i.progressLogs && i.progressLogs.length > 0) && (
                <div className="linways-card" style={{ marginBottom: '2rem' }}>
                    <div className="linways-card-header">
                        <h4>PROGRESS UPDATES</h4>
                    </div>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {internships.filter(i => i.progressLogs && i.progressLogs.length > 0).map(intern => (
                            <div key={intern._id} style={{ padding: '1rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                <p style={{ fontWeight: '800', fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                                    {(intern.companyName || intern.opportunityId?.companyName || 'N/A').toUpperCase()} — {intern.role || intern.opportunityId?.title || 'N/A'}
                                </p>
                                {intern.progressLogs.map((log, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '1rem', padding: '0.4rem 0', paddingLeft: '1rem', borderLeft: '3px solid #0891b220' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', minWidth: '100px' }}>
                                            {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        <p style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-main)' }}>{log.updateText}</p>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ══ Internship Approval Journey ═════════════════════════════════ */}
            <div className="linways-card" style={{ marginBottom: '2rem' }}>
                <div className="linways-card-header">
                    <h4>INSTITUTIONAL APPROVAL TRACKER</h4>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Real-time status across academic leadership desks</p>
                </div>
                {internships.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No approval tracks to show.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', padding: '1rem' }}>
                        {internships.map(intern => (
                            <div key={intern._id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '3rem' }}>
                                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <p style={{ fontWeight: '1000', fontSize: '1.1rem', color: 'var(--primary)', letterSpacing: '-0.5px' }}>
                                        {(intern.companyName || intern.opportunityId?.companyName || 'N/A').toUpperCase()} — {intern.role || intern.opportunityId?.title || 'N/A'}
                                    </p>
                                    <span style={{ fontSize: '0.7rem', fontWeight: '800', background: '#f1f5f9', padding: '4px 12px', borderRadius: '8px' }}>
                                        LEVEL: {intern.currentApprovalLevel || 'UNKNOWN'}
                                    </span>
                                </header>
                                
                                <ApplicationJourney 
                                    currentLevel={intern.currentApprovalLevel} 
                                    finalStatus={intern.finalStatus} 
                                    approvalFlow={intern.approvalFlow} 
                                />
                                
                                {intern.finalStatus?.toUpperCase() === 'APPROVED' && (
                                     <div style={{ marginTop: '2rem', padding: '1rem', background: '#d1fae540', borderRadius: '12px', border: '1px solid #10b98140', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ fontSize: '1.5rem' }}>🏆</div>
                                        <div>
                                            <p style={{ fontSize: '0.85rem', fontWeight: '900', color: '#047857' }}>INSTITUTIONAL PROCESS COMPLETE</p>
                                            <p style={{ fontSize: '0.7rem', color: '#065f46', fontWeight: '700' }}>Your official No Objection Certificate (NOC) is now available for download.</p>
                                        </div>
                                        <button 
                                            onClick={() => handleViewNOC(intern._id)}
                                            style={{ marginLeft: 'auto', background: '#059669', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: '900', fontSize: '0.7rem', cursor: 'pointer' }}
                                        >DOWNLOAD NOC</button>
                                     </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* ══ Request Approval Modal ══════════════════════════════════════════ */}
            {approvalModal.show && (
                <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', background: 'rgba(30,27,75,0.4)' }} onClick={() => setApprovalModal({ show: false, appId: null })}>
                    <div className="modal-content" style={{ padding: '2.5rem', borderRadius: '24px', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '950', marginBottom: '1rem', color: 'var(--text-main)' }}>REQUEST FACULTY APPROVAL</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Please provide the public URL to your Offer Letter for verification.</p>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>OFFER LETTER URL (GDrive/OneDrive/etc.) *</label>
                            <input
                                type="url"
                                value={offerLetterURL}
                                onChange={e => setOfferLetterURL(e.target.value)}
                                placeholder="https://drive.google.com/file/d/..."
                                style={{
                                    width: '100%', padding: '0.8rem 1rem', borderRadius: '12px',
                                    border: '2px solid #e2e8f0', fontSize: '0.9rem',
                                    fontFamily: 'inherit',
                                }}
                                required
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn-outline" style={{ flex: 1, padding: '0.8rem', fontWeight: '800' }} onClick={() => setApprovalModal({ show: false, appId: null })}>
                                CANCEL
                            </button>
                            <button className="btn-primary" style={{ flex: 1, padding: '0.8rem', fontWeight: '800', background: 'linear-gradient(135deg, #059669, #047857)' }} onClick={handleRequestApproval}>
                                SUBMIT REQUEST
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ Add Progress Modal ══════════════════════════════════════════ */}
            {progressModal.show && (
                <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', background: 'rgba(30,27,75,0.4)' }} onClick={() => setProgressModal({ show: false, appId: null })}>
                    <div className="modal-content" style={{ padding: '2.5rem', borderRadius: '24px', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '950', marginBottom: '1rem', color: 'var(--text-main)' }}>ADD PROGRESS UPDATE</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Describe what you worked on this week.</p>
                        <textarea
                            value={progressText}
                            onChange={e => setProgressText(e.target.value)}
                            placeholder="e.g. Completed the login module and unit tests..."
                            rows={4}
                            style={{
                                width: '100%', padding: '1rem', borderRadius: '12px',
                                border: '2px solid #e2e8f0', fontSize: '0.9rem',
                                fontFamily: 'inherit', resize: 'vertical', marginBottom: '1.5rem',
                            }}
                        />
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn-outline" style={{ flex: 1, padding: '0.8rem', fontWeight: '800' }} onClick={() => setProgressModal({ show: false, appId: null })}>
                                CANCEL
                            </button>
                            <button className="btn-primary" style={{ flex: 1, padding: '0.8rem', fontWeight: '800', background: 'linear-gradient(135deg, #0891b2, #0e7490)' }} onClick={handleAddProgress}>
                                SUBMIT UPDATE
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ Alert Modal ═════════════════════════════════════════════════ */}
            {alertModal.show && (
                <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', background: 'rgba(30,27,75,0.4)' }} onClick={() => setAlertModal({ ...alertModal, show: false })}>
                    <div className="modal-content" style={{ padding: '3rem 2.5rem', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{alertModal.success ? '📜' : '⚠️'}</div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '850', marginBottom: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase' }}>{alertModal.success ? 'Action Recorded' : 'Process Error'}</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontWeight: '600', fontSize: '0.9rem' }}>{alertModal.message}</p>
                        <button className="btn-primary" style={{ width: '100%', padding: '1rem', fontWeight: '850' }} onClick={() => setAlertModal({ ...alertModal, show: false })}>
                            CONFIRM & CLOSE
                        </button>
                    </div>
                </div>
            )}
            {/* ══ Application Journey Modal ══════════════════════════════════════ */}
            {historyModal.show && (
                <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', background: 'rgba(30,27,75,0.4)' }} onClick={() => setHistoryModal({ show: false, history: [] })}>
                    <div className="modal-content" style={{ padding: '2.5rem', borderRadius: '24px', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.8rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '950', color: 'var(--text-main)' }}>APPLICATION JOURNEY</h2>
                            <button onClick={() => setHistoryModal({ show: false, history: [] })} style={{ background: 'none', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                        </div>
                        <TimelineComponent history={historyModal.history} />
                    </div>
                </div>
            )}

            {/* ══ NOC View Modal ══════════════════════════════════════════════════ */}
            {nocModal.show && (
                <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.85)', padding: '2rem' }} onClick={() => setNocModal({ show: false, data: null })}>
                    <div style={{ maxWidth: '900px', width: '100%', maxHeight: '95vh', overflowY: 'auto', background: 'white', borderRadius: '8px', padding: '1rem' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1rem' }}>
                            <button onClick={() => window.print()} className="btn-primary" style={{ padding: '8px 20px' }}>🖨️ PRINT / DOWNLOAD</button>
                            <button onClick={() => setNocModal({ show: false, data: null })} className="btn-outline" style={{ padding: '8px 20px' }}>✕ CLOSE</button>
                        </div>
                        <div className="noc-printable">
                            <NOCViewer data={nocModal.data} />
                        </div>
                    </div>
                </div>
            )}
            {/* ══ Certificate View Modal ═══════════════════════════════════════════════ */}
            {certModal.show && (
                <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.85)', padding: '2rem' }} onClick={() => setCertModal({ show: false, data: null })}>
                    <div style={{ maxWidth: '900px', width: '100%', maxHeight: '95vh', overflowY: 'auto', background: 'white', borderRadius: '8px', padding: '1rem' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1rem' }}>
                            <button onClick={() => setCertModal({ show: false, data: null })} className="btn-outline" style={{ padding: '8px 20px' }}>✕ CLOSE</button>
                        </div>
                        <CompletionLetterViewer data={certModal.data} />
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Shared styles ────────────────────────────────────────────────────────────
const labelStyle = {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.3rem',
    display: 'block',
};

const inputStyle = {
    width: '100%',
    padding: '0.7rem 1rem',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
};

export default InternshipDashboard;
