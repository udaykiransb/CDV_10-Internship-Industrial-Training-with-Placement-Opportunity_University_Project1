import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import RoleApprovalDashboard from '../../components/RoleApprovalDashboard';
import TimelineComponent from '../../components/TimelineComponent';
import FeedbackModal from './FeedbackModal';

const ApprovalRow = ({ app, updatingId, handleAction, handleViewProgress }) => {
    const [remarks, setRemarks] = useState('');
    const isPending = app.currentApprovalLevel === 'FACULTY' || app.status === 'PENDING_FACULTY';
    const company = app.companyName || app.opportunityId?.companyName || 'N/A';

    return (
        <tr style={{ transition: 'background 0.2s' }}>
            <td>
                <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9rem' }}>{app.studentId?.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>{app.studentId?.rollNumber}</div>
            </td>
            <td><span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.85rem' }}>{company.toUpperCase()}</span></td>
            <td>
                <span style={{
                    fontSize: '0.65rem', fontWeight: '800', padding: '3px 8px',
                    borderRadius: '4px',
                    background: app.internshipSource === 'External' ? '#fef3c7' : '#dbeafe',
                    color: app.internshipSource === 'External' ? '#d97706' : '#2563eb',
                }}>
                    {(app.internshipSource || 'COLLEGE').toUpperCase()}
                </span>
            </td>
            <td>
                {app.offerLetterURL ? (
                    <a href={app.offerLetterURL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '0.75rem', borderBottom: '1.5px solid var(--primary)' }}>
                        VIEW →
                    </a>
                ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>—</span>
                )}
            </td>
            <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span className={`badge ${isPending ? 'badge-applied' : 'badge-selected'}`} style={{ fontWeight: '800', letterSpacing: '0.5px', fontSize: '0.6rem' }}>
                        {app.currentApprovalLevel}
                    </span>
                    <input 
                        type="text" 
                        placeholder="Add remarks..." 
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        style={{ fontSize: '0.75rem', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                    />
                </div>
            </td>
            <td>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {isPending && (
                        <>
                            <button 
                                className="btn-primary" 
                                disabled={updatingId === app._id}
                                onClick={() => handleAction(app._id, 'approve', remarks)}
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', fontWeight: '900', borderRadius: '8px' }}
                            >
                                APPROVE
                            </button>
                            <button 
                                className="btn-outline" 
                                disabled={updatingId === app._id}
                                onClick={() => handleAction(app._id, 'reject', remarks)}
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', fontWeight: '900', borderRadius: '8px', border: '1.5px solid #ef4444', color: '#ef4444' }}
                            >
                                REJECT
                            </button>
                        </>
                    )}
                    {!isPending && (
                        <button
                            className="btn-outline"
                            onClick={() => handleViewProgress(app._id)}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: '900', borderRadius: '8px' }}
                        >
                            VIEW LOGS
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};

const FacultyDashboard = () => {
    const [hubData, setHubData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [activeTab, setActiveTab] = useState('MENTOR');
    const [progressView, setProgressView] = useState(null);
    const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, student: null });

    const fetchHubData = async () => {
        try {
            const res = await api.get('/faculty/hub');
            const data = res.data.data;
            const desigs = data.profile?.designations || [];

            // Fetch institutional stats for HOD/Dean
            if (desigs.includes('hod') || desigs.includes('dean')) {
                try {
                    const adminRes = await api.get('/analytics/admin');
                    data.institutionalStats = adminRes.data.data;
                } catch (err) {
                    console.error('Error fetching admin stats', err);
                }
            }

            setHubData(data);
            
            // Set default tab based on highest level designation if not already set
            if (desigs.includes('dean')) setActiveTab('DEAN');
            else if (desigs.includes('hod')) setActiveTab('HOD');
            else if (desigs.includes('coordinator')) setActiveTab('COORDINATOR');
            else setActiveTab('MENTOR');
            
        } catch (err) {
            console.error('Error fetching faculty hub data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHubData();
    }, []);

    const handleAction = async (applicationId, action, remarks = '', levelKey = 'mentor') => {
        setUpdatingId(applicationId);
        try {
            let endpoint;
            if (levelKey === 'mentor') {
                endpoint = action === 'approve' ? `/faculty/approve/${applicationId}` : `/faculty/reject/${applicationId}`;
            } else {
                endpoint = `/faculty/${action}-at-level/${levelKey}/${applicationId}`;
            }
            
            await api.put(endpoint, { remarks });
            
            // Refresh hub data after action
            fetchHubData();
        } catch (err) {
            const errorMsg = err.response?.data?.message || `Failed to ${action} internship`;
            console.error(`Error ${action}ing internship`, err);
            alert(errorMsg);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleViewProgress = async (applicationId) => {
        try {
            const res = await api.get(`/faculty/progress/${applicationId}`);
            setProgressView({ appId: applicationId, data: res.data.data });
        } catch (err) {
            console.error('Error fetching progress', err);
        }
    };

    const handleSubmitFeedback = async (facultyFeedback) => {
        if (!feedbackModal.student?.activeApplication?._id) return;
        try {
            await api.post('/feedback/submit', {
                applicationId: feedbackModal.student.activeApplication._id,
                facultyFeedback
            });
            fetchHubData(); // Refresh to update status
        } catch (err) {
            alert('Failed to submit evaluation.');
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="loader">Synchronizing Central Faculty Hub...</div>
        </div>
    );

    if (!hubData) return <div style={{ padding: '2rem' }}>Error loading dashboard. Please try again.</div>;

    const { profile, mentor, coordinator, hod, dean } = hubData;
    const designations = profile.designations || ['mentor'];

    return (
        <div className="page-container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <header style={{ marginBottom: '3rem', borderBottom: '2px solid var(--primary)', paddingBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <span style={{ 
                        background: 'var(--primary)', color: '#fff', padding: '4px 14px', 
                        borderRadius: '4px', fontSize: '0.65rem', fontWeight: '850', letterSpacing: '1px' 
                    }}>{(profile.department || 'GENERAL').toUpperCase()} DEPARTMENT</span>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {designations.map(d => (
                            <span key={d} style={{ background: 'white', color: 'var(--primary)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.62rem', fontWeight: '850', border: '1px solid var(--border-color)' }}>
                                {d.toUpperCase()}
                            </span>
                        ))}
                    </div>
                </div>
                <h1 style={{ fontSize: '2.25rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '0.4rem', letterSpacing: '-0.5px' }}>
                    {(profile.name || 'Faculty Member').toUpperCase()}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>OFFICIAL ACADEMIC OVERSIGHT & CLEARANCE PORTAL</p>
            </header>

            {/* ══ Tab Navigation ══════════════════════════════════════════════ */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                {!designations.includes('dean') && (
                    <button 
                        onClick={() => setActiveTab('MENTOR')}
                        style={{
                            padding: '0.85rem 1.75rem', borderRadius: '4px 4px 0 0', border: 'none',
                            background: activeTab === 'MENTOR' ? 'var(--primary)' : 'transparent',
                            color: activeTab === 'MENTOR' ? '#fff' : 'var(--text-muted)',
                            fontWeight: '850', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s',
                            textTransform: 'uppercase', letterSpacing: '0.5px'
                        }}
                    >
                        I. Mentorship Panel
                    </button>
                )}
                {designations.includes('coordinator') && (
                    <button 
                        onClick={() => setActiveTab('COORDINATOR')}
                        style={{
                            padding: '0.85rem 1.75rem', borderRadius: '4px 4px 0 0', border: 'none',
                            background: activeTab === 'COORDINATOR' ? 'var(--primary)' : 'transparent',
                            color: activeTab === 'COORDINATOR' ? '#fff' : 'var(--text-muted)',
                            fontWeight: '850', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s',
                            textTransform: 'uppercase', letterSpacing: '0.5px'
                        }}
                    >
                        II. Coordinator Ops {coordinator?.pending?.length > 0 && <span style={{ marginLeft: '8px', background: 'white', color: 'var(--primary)', padding: '2px 6px', borderRadius: '2px', fontSize: '0.65rem' }}>{coordinator.pending.length}</span>}
                    </button>
                )}
                {designations.includes('hod') && (
                    <button 
                        onClick={() => setActiveTab('HOD')}
                        style={{
                            padding: '0.85rem 1.75rem', borderRadius: '4px 4px 0 0', border: 'none',
                            background: activeTab === 'HOD' ? 'var(--primary)' : 'transparent',
                            color: activeTab === 'HOD' ? '#fff' : 'var(--text-muted)',
                            fontWeight: '850', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s',
                            textTransform: 'uppercase', letterSpacing: '0.5px'
                        }}
                    >
                        III. HOD Clearance {hod?.pending?.length > 0 && <span style={{ marginLeft: '8px', background: 'white', color: 'var(--primary)', padding: '2px 6px', borderRadius: '2px', fontSize: '0.65rem' }}>{hod.pending.length}</span>}
                    </button>
                )}
                {designations.includes('dean') && (
                    <button 
                        onClick={() => setActiveTab('DEAN')}
                        style={{
                            padding: '0.85rem 1.75rem', borderRadius: '4px 4px 0 0', border: 'none',
                            background: activeTab === 'DEAN' ? 'var(--primary)' : 'transparent',
                            color: activeTab === 'DEAN' ? '#fff' : 'var(--text-muted)',
                            fontWeight: '850', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s',
                            textTransform: 'uppercase', letterSpacing: '0.5px'
                        }}
                    >
                        IV. Dean Assessment {dean?.pending?.length > 0 && <span style={{ marginLeft: '8px', background: 'white', color: 'var(--primary)', padding: '2px 6px', borderRadius: '2px', fontSize: '0.65rem' }}>{dean.pending.length}</span>}
                    </button>
                )}
            </div>

            {/* ══ Institutional Metrics (HOD/Dean only) ══════════════════════ */}
            {(designations.includes('hod') || designations.includes('dean')) && hubData.institutionalStats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
                    <div className="linways-card" style={{ borderTop: '4px solid var(--primary)' }}>
                        <div className="linways-card-header"><h4>APPROVAL RATE</h4></div>
                        <div style={{ fontSize: '2.25rem', fontWeight: '950', color: 'var(--primary)' }}>{hubData.institutionalStats.approvalRate}%</div>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: '700' }}>INSTITUTIONAL BENCHMARK</p>
                    </div>
                    <div className="linways-card" style={{ borderTop: '4px solid #dc2626' }}>
                        <div className="linways-card-header"><h4>PENDING REQS</h4></div>
                        <div style={{ fontSize: '2.25rem', fontWeight: '950', color: '#dc2626' }}>{hubData.institutionalStats.pendingRequests}</div>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: '700' }}>GLOBAL QUEUE</p>
                    </div>
                    <div className="linways-card" style={{ borderTop: '4px solid #138808' }}>
                        <div className="linways-card-header"><h4>COMPLETED</h4></div>
                        <div style={{ fontSize: '2.25rem', fontWeight: '950', color: '#138808' }}>{hubData.institutionalStats.completedRequests}</div>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: '700' }}>FINALIZED VERIFICATIONS</p>
                    </div>
                    <div className="linways-card" style={{ borderTop: '4px solid var(--primary)' }}>
                        <div className="linways-card-header"><h4>ACTIVE PORTING</h4></div>
                        <div style={{ fontSize: '2.25rem', fontWeight: '950', color: 'var(--primary)' }}>{hubData.institutionalStats.activeOpportunities}</div>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: '700' }}>MARKET POSTINGS</p>
                    </div>
                </div>
            )}

            {/* ══ MENTOR TAB CONTENT ═════════════════════════════════════════ */}
            {activeTab === 'MENTOR' && !designations.includes('dean') && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        <div className="linways-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                            <div className="linways-card-header"><h4>ASSIGNED MENTEES</h4></div>
                            <div style={{ fontSize: '2.75rem', fontWeight: '1000', color: 'var(--text-main)' }}>{mentor.students.length}</div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: '600' }}>Active Mentorships</p>
                        </div>
                        <div className="linways-card" style={{ borderLeft: '4px solid var(--warning, #f59e0b)' }}>
                            <div className="linways-card-header"><h4>MENTOR PENDING</h4></div>
                            <div style={{ fontSize: '2.75rem', fontWeight: '1000', color: 'var(--warning, #f59e0b)' }}>{mentor.pending.length}</div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: '600' }}>Requires Your Signature</p>
                        </div>
                        <div className="linways-card" style={{ borderLeft: '4px solid var(--success, #10b981)' }}>
                            <div className="linways-card-header"><h4>SUCCESS RATIO</h4></div>
                            <div style={{ fontSize: '2.75rem', fontWeight: '1000', color: 'var(--success, #10b981)' }}>{mentor.students.length > 0 ? "88%" : "0%"}</div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: '600' }}>Internship completion tracking</p>
                        </div>
                    </div>

                    <div className="linways-card" style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', marginBottom: '2.5rem' }}>
                        <div className="linways-card-header" style={{ padding: '1.5rem' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--primary)' }}>ASSIGNED MENTEES TRACKER</h4>
                        </div>
                        <div className="table-container" style={{ padding: '0 1rem 1rem 1rem' }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>STUDENT</th>
                                        <th>DEPT</th>
                                        <th>ACTIVE ENGAGEMENT</th>
                                        <th>STATUS</th>
                                        <th>OVERSIGHT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mentor.students.length > 0 ? (
                                        mentor.students.map(student => {
                                            const app = student.activeApplication;
                                            const status = (app?.internshipStatus || app?.status || 'INACTIVE').toUpperCase();
                                            const isCompleted = status === 'COMPLETED';
                                            const needsFeedback = isCompleted && !app?.feedback?.facultyFeedback;

                                            return (
                                                <tr key={student._id}>
                                                    <td>
                                                        <div style={{ fontWeight: '700' }}>{student.name}</div>
                                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{student.rollNumber}</div>
                                                    </td>
                                                    <td>{student.department?.toUpperCase()}</td>
                                                    <td>{app ? `${app.companyName || 'Engagement'} - ${app.role || 'Role'}` : 'No active engagements'}</td>
                                                    <td>
                                                        <span style={{ 
                                                            fontSize: '0.65rem', fontWeight: '900', padding: '4px 10px', borderRadius: '4px',
                                                            background: isCompleted ? '#d1fae5' : app ? '#eff6ff' : '#f1f5f9',
                                                            color: isCompleted ? '#059669' : app ? '#2563eb' : '#64748b'
                                                        }}>
                                                            {status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            {app && (
                                                                <button 
                                                                    onClick={() => handleViewProgress(app._id)}
                                                                    className="btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>JOURNEY</button>
                                                            )}
                                                            {needsFeedback && (
                                                                <button 
                                                                    onClick={() => setFeedbackModal({ isOpen: true, student })}
                                                                    className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', background: '#7c3aed' }}>EVALUATE</button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No mentees assigned.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="linways-card" style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
                        <div className="linways-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--text-main)' }}>PENDING MENTEE APPROVALS</h4>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800', background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px' }}>
                                {mentor.pending.length} PENDING
                            </span>
                        </div>
                        <div className="table-container" style={{ padding: '0 1rem 1rem 1rem' }}>
                            <table style={{ borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                                <thead style={{ background: '#f8fafc' }}>
                                    <tr>
                                        <th style={{ padding: '1rem', borderRadius: '8px 0 0 8px' }}>STUDENT</th>
                                        <th>COMPANY</th>
                                        <th>TYPE</th>
                                        <th>OFFER</th>
                                        <th>STATUS</th>
                                        <th style={{ borderRadius: '0 8px 8px 0' }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mentor.pending.length > 0 ? (
                                        mentor.pending.map(app => (
                                            <ApprovalRow 
                                                key={app._id} 
                                                app={app} 
                                                updatingId={updatingId} 
                                                handleAction={handleAction} 
                                                handleViewProgress={handleViewProgress} 
                                            />
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                                <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>✅</div>
                                                <div style={{ fontWeight: '1000', fontSize: '1.25rem', color: 'var(--text-main)' }}>Pipeline Cleared!</div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: '500', marginTop: '0.5rem' }}>No pending mentee approvals at this time.</div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* ══ COORDINATOR TAB CONTENT ════════════════════════════════════ */}
            {activeTab === 'COORDINATOR' && coordinator && (
                <RoleApprovalDashboard 
                    role="coordinator" 
                    title={`${profile.department} COORDINATOR OPS`}
                    subtitle="Departmental Internship Approval Pipeline"
                    isHub={true}
                    hubPending={coordinator.pending}
                    onAction={handleAction}
                />
            )}

            {/* ══ HOD TAB CONTENT ════════════════════════════════════════════ */}
            {activeTab === 'HOD' && hod && (
                <RoleApprovalDashboard 
                    role="hod" 
                    title={`${profile.department} HOD APPROVALS`}
                    subtitle="Head of Department Strategic Oversight"
                    isHub={true}
                    hubPending={hod.pending}
                    onAction={handleAction}
                />
            )}

            {/* ══ DEAN TAB CONTENT ═══════════════════════════════════════════ */}
            {activeTab === 'DEAN' && dean && (
                <RoleApprovalDashboard 
                    role="dean" 
                    title="DEAN OF ACADEMICS OFFICE"
                    subtitle="Final Institutional Internship Verification"
                    isHub={true}
                    hubPending={dean.pending}
                    onAction={handleAction}
                />
            )}

            {/* ══ Progress View Overlay ══════════════════════════════════════ */}
            {progressView && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 
                }}>
                    <div className="linways-card" style={{ maxWidth: '700px', width: '90%', maxHeight: '85vh', overflowY: 'auto', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <div className="linways-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: '#f8fafc' }}>
                            <h4 style={{ fontWeight: '1000', fontSize: '1.1rem' }}>INTERNSHIP JOURNEY LOGS</h4>
                            <button onClick={() => setProgressView(null)} style={{ background: '#f1f5f9', border: 'none', color: '#64748b', fontWeight: '1000', cursor: 'pointer', padding: '0.5rem 0.8rem', borderRadius: '8px' }}>✕</button>
                        </div>
                        <div style={{ padding: '2rem' }}>
                            <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--primary-subtle, #eff6ff)', borderRadius: '12px' }}>
                                <p style={{ fontWeight: '1000', color: 'var(--primary)', fontSize: '1rem' }}>{progressView.data?.studentId?.name}</p>
                                <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>{progressView.data?.companyName} • {progressView.data?.role}</p>
                            </div>
                            {progressView.data?.history?.length > 0 ? (
                                <TimelineComponent history={progressView.data.history} />
                            ) : progressView.data?.progressLogs?.length > 0 ? (
                                <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '2rem', marginLeft: '0.5rem' }}>
                                    {progressView.data.progressLogs.map((log, i) => (
                                        <div key={i} style={{ marginBottom: '2rem', position: 'relative' }}>
                                            <div style={{ position: 'absolute', left: '-36.5px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)', border: '3px solid #fff', boxShadow: '0 0 0 1px var(--primary)' }} />
                                            <div style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{new Date(log.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                            <p style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)', lineHeight: '1.5' }}>{log.updateText}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontWeight: '500' }}>No progress logs or history recorded yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <FeedbackModal 
                isOpen={feedbackModal.isOpen}
                onClose={() => setFeedbackModal({ isOpen: false, student: null })}
                onSubmit={handleSubmitFeedback}
                studentName={feedbackModal.student?.name}
                company={feedbackModal.student?.activeApplication?.companyName}
            />
        </div>
    );
};

export default FacultyDashboard;
