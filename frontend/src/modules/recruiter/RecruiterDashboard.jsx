import React, { useState, useEffect } from 'react';
import api from '../../api/api';

const RecruiterDashboard = () => {
    const [stats, setStats] = useState({
        posted: 0,
        received: 0,
        shortlisted: 0
    });
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [minMatchScore, setMinMatchScore] = useState(0);
    const [bulkN, setBulkN] = useState(5);
    const [selectedOppId, setSelectedOppId] = useState('');
    const [opportunities, setOpportunities] = useState([]);
    const [message, setMessage] = useState('');

    // Scheduling State
    const [schedulingApp, setSchedulingApp] = useState(null);
    const [scheduleData, setScheduleData] = useState({
        title: 'Technical Interview',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        meetingUrl: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [appsRes, oppsRes] = await Promise.all([
                api.get('/application/recruiter/all'),
                api.get('/opportunity?mine=true')
            ]);
            
            setApplicants(appsRes.data.data || []);
            setOpportunities(oppsRes.data.data || []);
            
            const apps = appsRes.data.data || [];
            setStats({
                posted: oppsRes.data.data?.length || 0,
                received: apps.length,
                shortlisted: apps.filter(a => (a.status || '').toUpperCase() === 'SHORTLISTED').length
            });
        } catch (err) {
            console.error('Error fetching recruiter data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleShortlist = async (id) => {
        setUpdatingId(id);
        try {
            await api.patch(`/application/${id}/shortlist`);
            setMessage('Candidate shortlisted successfully!');
            fetchData();
        } catch (err) {
            console.error(err);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleSelect = async (id) => {
        setUpdatingId(id);
        try {
            await api.patch(`/application/${id}/select`);
            setMessage('Candidate selected successfully!');
            fetchData();
        } catch (err) {
            console.error(err);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleBulkShortlist = async () => {
        if (!selectedOppId) return alert('Select an opportunity first');
        try {
            await api.post('/application/bulk-shortlist', { opportunityId: selectedOppId, topN: bulkN });
            setMessage(`Successfully shortlisted top ${bulkN} candidates!`);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSchedule = async (e) => {
        e.preventDefault();
        try {
            await api.post('/interview/schedule', {
                ...scheduleData,
                applicationId: schedulingApp._id
            });
            setMessage(`Interview scheduled for ${schedulingApp.studentId?.name}`);
            setSchedulingApp(null);
            setScheduleData({ title: 'Technical Interview', date: '', startTime: '', endTime: '', location: '', meetingUrl: '' });
        } catch (err) {
            console.error(err);
            alert('Failed to schedule interview');
        }
    };

    const filteredApplicants = applicants.filter(app => {
        const scoreMatch = app.matchScore >= minMatchScore;
        const oppMatch = selectedOppId ? app.opportunityId?._id === selectedOppId : true;
        return scoreMatch && oppMatch;
    });

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <div className="loader">Synchronizing Recruitment Data...</div>
        </div>
    );

    return (
        <div className="page-container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2.5rem', borderBottom: '2px solid var(--primary)', paddingBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '0.25rem', letterSpacing: '-0.5px', textTransform: 'uppercase' }}>
                    RECRUITMENT OPERATIONS HUB
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Strategic Talent Acquisition & Institutional Pipeline Management</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '2.5rem' }}>
                <div className="linways-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div className="linways-card-header">
                        <h4>POSTED OPPORTUNITIES</h4>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-main)' }}>{stats.posted}</div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Active Job Listings</p>
                </div>
                <div className="linways-card" style={{ borderLeft: '4px solid var(--info, #3b82f6)' }}>
                    <div className="linways-card-header">
                        <h4>APPLICATIONS RECEIVED</h4>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--info, #3b82f6)' }}>{stats.received}</div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Candidate Submissions</p>
                </div>
                <div className="linways-card" style={{ borderLeft: '4px solid var(--success, #10b981)' }}>
                    <div className="linways-card-header">
                        <h4>SELECTED TALENT</h4>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--success, #10b981)' }}>{applicants.filter(a => (a.status || '').toUpperCase() === 'SELECTED').length}</div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Hired/Finalized Candidates</p>
                </div>
            </div>

            {/* ATS Workflow Actions */}
            <div className="linways-card" style={{ marginBottom: '2.5rem', background: 'linear-gradient(to right, #f8fafc, #ffffff)' }}>
                <div className="linways-card-header">
                    <h4>ATS WORKFLOW & AUTOMATION</h4>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', padding: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)' }}>FILTER BY OPPORTUNITY</label>
                        <select 
                            value={selectedOppId} 
                            onChange={(e) => setSelectedOppId(e.target.value)}
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '0.4rem' }}
                        >
                            <option value="">All Opportunities</option>
                            {opportunities.map(o => <option key={o._id} value={o._id}>{o.title} ({o.companyName})</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)' }}>MIN MATCH SCORE (%)</label>
                        <input 
                            type="range" min="0" max="100" value={minMatchScore} 
                            onChange={(e) => setMinMatchScore(e.target.value)}
                            style={{ width: '100%', marginTop: '0.8rem' }}
                        />
                        <div style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: '700' }}>{minMatchScore}% Match</div>
                    </div>
                    <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: '800' }}>AUTO-SHORTLIST TOP N</span>
                            <input 
                                type="number" min="1" max="50" value={bulkN} 
                                onChange={(e) => setBulkN(e.target.value)}
                                style={{ width: '50px', padding: '0.2rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                            />
                        </div>
                        <button 
                            className="btn-primary" 
                            disabled={!selectedOppId}
                            onClick={handleBulkShortlist}
                            style={{ fontSize: '0.75rem', padding: '0.5rem', width: '100%', borderRadius: '8px' }}
                        >
                            RUN AUTOMATION
                        </button>
                    </div>
                </div>
                {message && <p style={{ padding: '0 1rem 1rem', color: 'var(--primary)', fontWeight: '700', fontSize: '0.8rem' }}>{message}</p>}
            </div>

            <div className="linways-card">
                <div className="linways-card-header">
                    <h4>RECENT APPLICANT PIPELINE</h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>TOTAL {applicants.length}</span>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>APPLICANT NAME</th>
                                <th>MATCH SCORE</th>
                                <th>COMPETENCIES</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApplicants.map(app => {
                                const scoreColor = app.matchScore > 70 ? '#059669' : app.matchScore >= 40 ? '#d97706' : '#dc2626';
                                return (
                                <tr key={app._id}>
                                    <td>
                                        <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{app.studentId?.name?.toUpperCase() || 'N/A'}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '500' }}>{app.studentId?.rollNumber} • {app.studentId?.department}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '600' }}>{app.opportunityId?.title}</div>
                                    </td>
                                    <td>
                                        <div style={{ 
                                            width: '50px', height: '50px', borderRadius: '50%', 
                                            border: `4px solid ${scoreColor}20`, display: 'flex', 
                                            alignItems: 'center', justifyContent: 'center', 
                                            fontWeight: '900', color: scoreColor, fontSize: '0.85rem'
                                        }}>
                                            {app.matchScore}%
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                            {app.studentId?.skills?.slice(0, 4).map(skill => (
                                                <span key={skill} className="skill-tag" style={{ padding: '3px 8px', fontSize: '0.65rem', fontWeight: '700', background: '#f8fafc', border: '1px solid #e2e8f0' }}>{skill.toUpperCase()}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${['SHORTLISTED', 'SELECTED'].includes((app.status || '').toUpperCase()) ? 'badge-selected' : 'badge-applied'}`} style={{ fontWeight: '800', letterSpacing: '0.5px' }}>
                                            {(app.status || '').toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {app.status === 'APPLIED' && (
                                                <button 
                                                    className="btn-primary" 
                                                    disabled={updatingId === app._id}
                                                    onClick={() => handleShortlist(app._id)}
                                                    style={{ padding: '4px 10px', fontSize: '0.72rem', fontWeight: '850' }}
                                                >
                                                    SHORTLIST
                                                </button>
                                            )}
                                            {app.status === 'SHORTLISTED' && (
                                                <>
                                                    <button 
                                                        className="btn-primary" 
                                                        disabled={updatingId === app._id}
                                                        onClick={() => setSchedulingApp(app)}
                                                        style={{ padding: '4px 10px', fontSize: '0.72rem', fontWeight: '850', background: 'var(--primary)' }}
                                                    >
                                                        SCHEDULE
                                                    </button>
                                                    <button 
                                                        className="btn-primary" 
                                                        disabled={updatingId === app._id}
                                                        onClick={() => handleSelect(app._id)}
                                                        style={{ padding: '4px 10px', fontSize: '0.72rem', fontWeight: '850', background: '#059669' }}
                                                    >
                                                        SELECT
                                                    </button>
                                                </>
                                            )}
                                            <button 
                                                className="btn-outline" 
                                                onClick={() => window.open(app.studentId?.resumeURL, '_blank')}
                                                style={{ padding: '4px 10px', fontSize: '0.72rem', fontWeight: '850' }}
                                            >
                                                RESUME
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                )
                            })}
                            {applicants.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontWeight: '600' }}>No active applications found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Scheduling Modal */}
            {schedulingApp && (
                <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', background: 'rgba(30,27,75,0.4)' }} onClick={() => setSchedulingApp(null)}>
                    <div className="modal-content" style={{ padding: '2.5rem', borderRadius: '24px', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '950', marginBottom: '0.5rem', color: 'var(--text-main)' }}>SCHEDULE INTERVIEW</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                            Setting up engagement for <strong style={{color: 'var(--primary)'}}>{schedulingApp.studentId?.name?.toUpperCase()}</strong>
                        </p>
                        
                        <form onSubmit={handleSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Interview Title</label>
                                <input 
                                    style={inputStyle} 
                                    value={scheduleData.title} 
                                    onChange={e => setScheduleData({...scheduleData, title: e.target.value})}
                                    required 
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>Date</label>
                                    <input 
                                        type="date" 
                                        style={inputStyle} 
                                        value={scheduleData.date} 
                                        onChange={e => setScheduleData({...scheduleData, date: e.target.value})}
                                        required 
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={labelStyle}>Start Time</label>
                                        <input 
                                            type="time" 
                                            style={inputStyle} 
                                            value={scheduleData.startTime} 
                                            onChange={e => setScheduleData({...scheduleData, startTime: e.target.value})}
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>End Time</label>
                                        <input 
                                            type="time" 
                                            style={inputStyle} 
                                            value={scheduleData.endTime} 
                                            onChange={e => setScheduleData({...scheduleData, endTime: e.target.value})}
                                            required 
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Location / Instructions (Simple Text)</label>
                                <input 
                                    style={inputStyle} 
                                    placeholder="e.g. Office Room 302 or Online"
                                    value={scheduleData.location} 
                                    onChange={e => setScheduleData({...scheduleData, location: e.target.value})}
                                    required 
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Meeting Link (Optional)</label>
                                <input 
                                    style={inputStyle} 
                                    placeholder="Zoom / Google Meet URL"
                                    value={scheduleData.meetingUrl} 
                                    onChange={e => setScheduleData({...scheduleData, meetingUrl: e.target.value})}
                                />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn-outline" style={{ flex: 1, padding: '0.8rem' }} onClick={() => setSchedulingApp(null)}>CANCEL</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.8rem' }}>CONFIRM SCHEDULE</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const labelStyle = {
    fontSize: '0.65rem',
    fontWeight: '850',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.3rem',
    display: 'block'
};

const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '0.9rem',
    outline: 'none'
};

export default RecruiterDashboard;
