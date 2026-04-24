import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import DashboardCard from '../../components/DashboardCard';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalOpportunities: 0,
        totalApplications: 0,
        totalPlacedStudents: 0
    });
    const [users, setUsers] = useState([]);
    const [students, setStudents] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [studentSearch, setStudentSearch] = useState('');
    const [appSearch, setAppSearch] = useState('');
    const [activeTab, setActiveTab] = useState('STUDENTS'); // NEW: Tab system
    const navigate = useNavigate();

    // Export Logic
    const handleExport = async (type, id = null) => {
        try {
            const url = type === 'students' ? '/export/students' : `/export/applicants/${id}`;
            const response = await api.get(url, { responseType: 'blob' });
            
            // Create a link and trigger download
            const blob = new Blob([response.data], { type: 'text/csv' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', type === 'students' ? 'student_registry.csv' : 'applicants_report.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Export failed', err);
            alert('Failed to generate export file.');
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, appsRes, usersRes, studentsRes, analyticsRes] = await Promise.all([
                    api.get('/placement/dashboard'),
                    api.get('/placement/applications'),
                    api.get('/auth'),
                    api.get('/student/all'),
                    api.get('/analytics/placement')
                ]);

                setStats({ ...statsRes.data.data, analytics: analyticsRes.data.data });
                setApplications(appsRes.data.data);
                setUsers(usersRes.data.data);
                setStudents(studentsRes.data.data);
            } catch (err) {
                console.error('Error fetching admin dashboard data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [refreshTrigger]);

    const handleRoleUpdate = async (userId, newRole) => {
        try {
            await api.post('/admin/assign-role', { userId, role: newRole });
            setRefreshTrigger(prev => prev + 1);
            alert('User role updated successfully');
        } catch (err) {
            console.error('Error updating role', err);
            alert('Failed to update role');
        }
    };

    const handleFacultyAssign = async (studentId, facultyId) => {
        try {
            await api.post('/admin/assign-faculty', { facultyId, studentIds: [studentId] });
            setRefreshTrigger(prev => prev + 1);
            alert('Faculty assigned successfully');
        } catch (err) {
            console.error('Error assigning faculty', err);
            alert('Failed to assign faculty');
        }
    };

    const handleStatusUpdate = async (applicationId, newStatus) => {
        setUpdatingId(applicationId);
        try {
            await api.put(`/placement/application-status/${applicationId}`, { status: newStatus });
            // Update local state
            setApplications(prev => prev.map(app => 
                app._id === applicationId ? { ...app, status: newStatus } : app
            ));
            // Also update stats if someone was selected or unselected
            const statsRes = await api.get('/placement/dashboard');
            setStats(statsRes.data.data);
        } catch (err) {
            console.error('Error updating status', err);
            alert('Failed to update application status');
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <div className="loader">Synchronizing Administrative Data...</div>
        </div>
    );

    const statusOptions = ['APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED', 'APPROVED', 'PENDING_APPROVAL', 'COMPLETED'];
    const roleOptions = ['student', 'faculty', 'coordinator', 'hod', 'dean', 'recruiter', 'admin'];

    return (
        <div className="page-container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '0.25rem', letterSpacing: '-0.5px', textTransform: 'uppercase' }}>
                        CENTRAL PLACEMENT CONTROL
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Administrative Authority Panel • Global Oversight & Policy Monitoring</p>
                </div>
                <button
                    onClick={() => navigate('/create-opportunity')}
                    className="btn-primary"
                    style={{ padding: '0.85rem 1.75rem', fontWeight: '850' }}
                >
                    + INITIALIZE OPPORTUNITY
                </button>
            </header>
            {/* Statistics Section - Consolidated */}
            <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '1.5rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                    Institutional Metrics & Performance
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="linways-card" style={{ padding: '1.5rem', background: '#fff' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', marginBottom: '0.5rem' }}>TOTAL CANDIDATES</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: '1000', color: 'var(--primary)' }}>{stats.totalStudents}</div>
                    </div>
                    <div className="linways-card" style={{ padding: '1.5rem', background: '#fff' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', marginBottom: '0.5rem' }}>OPPORTUNITIES</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: '1000', color: '#2563eb' }}>{stats.totalOpportunities}</div>
                    </div>
                    <div className="linways-card" style={{ padding: '1.5rem', background: '#fff' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', marginBottom: '0.5rem' }}>APPLICATIONS</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: '1000', color: '#d97706' }}>{stats.totalApplications}</div>
                    </div>
                    <div className="linways-card" style={{ padding: '1.5rem', background: '#fff' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', marginBottom: '0.5rem' }}>SUCCESSFUL PLACEMENTS</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: '1000', color: '#059669' }}>{stats.totalPlacedStudents}</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: '850', color: 'var(--text-muted)' }}>SELECTION RATE</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${stats.analytics?.selectionRate || 0}%`, height: '100%', background: '#8b5cf6' }}></div>
                            </div>
                            <span style={{ fontWeight: '900', color: '#8b5cf6', fontSize: '0.9rem' }}>{stats.analytics?.selectionRate || 0}%</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: '850', color: 'var(--text-muted)' }}>APPROVAL EFFICIENCY</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${stats.analytics?.approvalRate || 0}%`, height: '100%', background: '#10b981' }}></div>
                            </div>
                            <span style={{ fontWeight: '900', color: '#10b981', fontSize: '0.9rem' }}>{stats.analytics?.approvalRate || 0}%</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 1rem', borderLeft: '1px solid #e2e8f0' }}>
                        <div>
                            <div style={{ fontSize: '0.6rem', fontWeight: '900', color: '#ef4444' }}>PENDING</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '1000', color: '#ef4444' }}>{stats.analytics?.approvalPending || 0}</div>
                        </div>
                        <div style={{ fontSize: '0.6rem', fontWeight: '800', color: 'var(--text-muted)', lineHeight: '1.2' }}>SIGNATURES<br/>REQUIRED</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 1rem', borderLeft: '1px solid #e2e8f0' }}>
                        <div>
                            <div style={{ fontSize: '0.6rem', fontWeight: '900', color: 'var(--primary)' }}>COMPLETED</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '1000', color: 'var(--primary)' }}>{stats.analytics?.approvalCompleted || 0}</div>
                        </div>
                        <div style={{ fontSize: '0.6rem', fontWeight: '800', color: 'var(--text-muted)', lineHeight: '1.2' }}>INTERNSHIPS<br/>FINALIZED</div>
                    </div>
                </div>
            </div>

            {/* ══ Management Hub Tab Navigation ════════════════════════════════ */}
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '2px solid #f1f5f9' }}>
                {[
                    { id: 'STUDENTS', label: 'I. Mentorship Registry', icon: '👨‍🎓' },
                    { id: 'APPLICATIONS', label: 'II. Pipeline Monitor', icon: '🛰️' },
                    { id: 'ROLES', label: 'III. Security & Roles', icon: '🛡️' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '1rem 0',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                            color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: '900',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'all 0.2s',
                            marginBottom: '-2px'
                        }}
                    >
                        <span>{tab.icon}</span>
                        {tab.label.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* ══ Tab Content ══════════════════════════════════════════════════ */}
            
            {activeTab === 'ROLES' && (
                <div className="linways-card" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                    <div className="linways-card-header">
                        <h4>SYSTEM ACCESS CONTROL</h4>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Modify institutional privileges and administrative roles.</p>
                    </div>
                    <div className="table-container" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>EMAIL</th>
                                    <th>CURRENT PRIVILEGE</th>
                                    <th>REASSIGN ROLE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id}>
                                        <td style={{ fontWeight: '600' }}>{u.email}</td>
                                        <td>
                                            <span className="badge" style={{ background: '#f1f5f9', color: 'var(--primary)', fontWeight: '850', fontSize: '0.65rem' }}>
                                                {u.role?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <select 
                                                value={u.role}
                                                onChange={(e) => handleRoleUpdate(u._id, e.target.value)}
                                                style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid #e2e8f0', fontWeight: '700' }}
                                            >
                                                {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'STUDENTS' && (
                <div className="linways-card" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                    <div className="linways-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h4>INSTITUTIONAL REGISTRY</h4>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Map students to faculty mentors and export records.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input 
                                type="text" 
                                placeholder="Search Name/Roll..." 
                                value={studentSearch}
                                onChange={(e) => setStudentSearch(e.target.value)}
                                style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', width: '250px' }}
                            />
                            <button 
                                onClick={() => handleExport('students')}
                                className="btn-outline"
                                style={{ padding: '0.5rem 1.25rem', fontSize: '0.75rem', fontWeight: '850' }}
                            >
                                📥 EXPORT CSV
                            </button>
                        </div>
                    </div>
                    <div className="table-container" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>CANDIDATE IDENTIFICATION</th>
                                    <th>ASSIGNED MENTOR</th>
                                    <th>FACULTY REASSIGNMENT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students
                                    .filter(s => 
                                        s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                                        s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase())
                                    )
                                    .map(s => {
                                        const currentMentor = users.find(u => u._id === s.assignedFaculty);
                                        const facultyUsers = users.filter(u => u.role === 'faculty');
                                        
                                        return (
                                            <tr key={s._id}>
                                                <td>
                                                    <div style={{ fontWeight: '850', color: 'var(--primary)', fontSize: '0.9rem' }}>{s.name?.toUpperCase()}</div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>{s.rollNumber} • {s.department}</div>
                                                </td>
                                                <td>
                                                    {currentMentor ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                                                            <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>{currentMentor.email}</span>
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: '800' }}>⚠️ UNASSIGNED</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <select 
                                                        value={s.assignedFaculty || ''}
                                                        onChange={(e) => handleFacultyAssign(s._id, e.target.value)}
                                                        style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid #e2e8f0', fontWeight: '700' }}
                                                    >
                                                        <option value="">Choose Mentor...</option>
                                                        {facultyUsers.map(f => (
                                                            <option key={f._id} value={f._id}>{f.email}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'APPLICATIONS' && (
                <div className="linways-card" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                    <div className="linways-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h4>APPLICATION JOURNEY TRACKER</h4>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Monitor real-time recruitment statuses and manually override cycles.</p>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Filter company/student..." 
                            value={appSearch}
                            onChange={(e) => setAppSearch(e.target.value)}
                            style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', width: '300px' }}
                        />
                    </div>
                    <div className="table-container" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>CANDIDATE</th>
                                    <th>OPPORTUNITY</th>
                                    <th>PROGRESSION STATE</th>
                                    <th>ADMIN OVERRIDE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications
                                    .filter(app => 
                                        app.studentId?.name?.toLowerCase().includes(appSearch.toLowerCase()) || 
                                        app.opportunityId?.companyName?.toLowerCase().includes(appSearch.toLowerCase())
                                    )
                                    .map(app => (
                                        <tr key={app._id}>
                                            <td>
                                                <div style={{ fontWeight: '800', color: 'var(--text-main)' }}>{app.studentId?.name}</div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700' }}>{app.studentId?.rollNumber}</div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: '900', color: 'var(--primary)', fontSize: '0.85rem' }}>{app.opportunityId?.companyName?.toUpperCase()}</div>
                                                <div style={{ fontSize: '0.7rem', fontWeight: '700' }}>{app.opportunityId?.title}</div>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${app.status?.toLowerCase().replace(' ', '-') || 'applied'}`} style={{
                                                    fontSize: '0.65rem', fontWeight: '900', padding: '4px 14px', borderRadius: '4px',
                                                    textTransform: 'uppercase', letterSpacing: '0.8px'
                                                }}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td>
                                                <select 
                                                    value={app.status} 
                                                    disabled={updatingId === app._id}
                                                    onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                                                    style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid #e2e8f0', fontWeight: '700', background: '#fff' }}
                                                >
                                                    {statusOptions.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
