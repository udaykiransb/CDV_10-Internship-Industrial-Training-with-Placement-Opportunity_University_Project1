import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

const OpportunityList = () => {
    const [opportunities, setOpportunities] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [activeTab, setActiveTab] = useState('description');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modal, setModal] = useState({ show: false, success: true, message: '' });
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id: urlParamId } = useParams();

    // Filters state
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [visibilityFilter, setVisibilityFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, OPEN, CLOSED, APPLIED, NOT_APPLIED
    const [sortBy, setSortBy] = useState('DEADLINE_ASC'); // DEADLINE_ASC, DEADLINE_DESC, POSTED_DESC
    const [viewScope, setViewScope] = useState('all');
    const [isEditingDeadline, setIsEditingDeadline] = useState(false);
    const [newDeadline, setNewDeadline] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const isJobExpired = (deadline) => {
        return new Date(deadline) < new Date();
    };

    useEffect(() => {
        if (user && user.role === 'admin' && viewScope === 'all' && !searchQuery) {
            // Default admin to 'mine' on first load if not changed
            setViewScope('mine');
        }
    }, [user]);

    useEffect(() => {
        const active = localStorage.getItem('activePortal');
        if (active === 'placement') setTypeFilter('PLACEMENT');
        else if (active === 'internship') setTypeFilter('INTERNSHIP');
    }, []);

    useEffect(() => {
        if (user) {
            console.log(`Fetching opportunities for ${user.role} with scope: ${viewScope}`);
            fetchOpportunities();
        }
    }, [viewScope, user]);

    const fetchOpportunities = async () => {
        setLoading(true);
        try {
            // Determine the 'mine' parameter based on role
            let mineParam = 'false';
            if (user?.role === 'admin') {
                mineParam = viewScope === 'mine' ? 'true' : 'false';
            } else if (user?.role === 'recruiter') {
                mineParam = 'true';
            }

            console.log(`API Call: /opportunity?mine=${mineParam}`);
            const response = await api.get(`/opportunity?mine=${mineParam}`);
            const data = response.data?.data || [];
            console.log(`Received ${data.length} items`);

            setOpportunities(data);
            
            // Auto-select job based on URL param or first in list
            if (data.length > 0) {
                if (urlParamId) {
                    const matchedJob = data.find(o => o._id === urlParamId);
                    if (matchedJob) {
                        setSelectedJob(matchedJob);
                        return;
                    }
                }
                
                setSelectedJob(prev => {
                    if (prev) {
                        const updated = data.find(o => o._id === prev._id);
                        return updated || data[0];
                    }
                    return data[0];
                });
            } else {
                setSelectedJob(null);
            }
        } catch (err) {
            console.error('Fetch Error:', err);
            setError('Failed to fetch opportunities: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateDeadline = async () => {
        if (!newDeadline) return;
        try {
            await api.put(`/opportunity/${selectedJob._id}`, { deadline: newDeadline });
            setModal({
                show: true,
                success: true,
                message: 'Deadline has been extended successfully!'
            });
            setIsEditingDeadline(false);
            fetchOpportunities();
        } catch (err) {
            setModal({
                show: true,
                success: false,
                message: 'Error updating deadline.'
            });
        }
    };

    const handleApply = async (opportunityId) => {
        try {
            await api.post(`/application/apply/${opportunityId}`);
            setModal({
                show: true,
                success: true,
                message: 'Your application has been submitted successfully!'
            });
            // Update local state to show "Applied"
            setOpportunities(prev => prev.map(opp =>
                opp._id === opportunityId ? { ...opp, isApplied: true } : opp
            ));
            if (selectedJob?._id === opportunityId) {
                setSelectedJob(prev => ({ ...prev, isApplied: true }));
            }
        } catch (err) {
            setModal({
                show: true,
                success: false,
                message: err.response?.data?.message || 'Error submitting application.'
            });
        }
    };

    const filteredJobs = opportunities
        .filter(job => {
            const title = job.title || '';
            const company = job.companyName || '';
            const jType = job.type || '';
            const isExpired = isJobExpired(job.deadline);
            const isApplied = job.isApplied;

            const search = searchQuery.toLowerCase().trim();
            const matchesSearch = !search || 
                title.toLowerCase().includes(search) ||
                company.toLowerCase().includes(search);

            const matchesType = typeFilter === 'ALL' ||
                (jType && jType.toUpperCase() === typeFilter.toUpperCase());

            const matchesVisibility = visibilityFilter === 'ALL' ||
                (job.visibility && job.visibility.toUpperCase() === visibilityFilter.toUpperCase());

            let matchesStatus = true;
            if (statusFilter === 'OPEN') matchesStatus = !isExpired && (job.isActive !== false);
            else if (statusFilter === 'CLOSED') matchesStatus = isExpired || (job.isActive === false);
            else if (statusFilter === 'APPLIED') matchesStatus = !!isApplied;
            else if (statusFilter === 'NOT_APPLIED') matchesStatus = !isApplied;

            return !!(matchesSearch && matchesType && matchesVisibility && matchesStatus);
        })
        .sort((a, b) => {
            if (sortBy === 'DEADLINE_ASC') return new Date(a.deadline) - new Date(b.deadline);
            if (sortBy === 'DEADLINE_DESC') return new Date(b.deadline) - new Date(a.deadline);
            if (sortBy === 'POSTED_DESC') return new Date(b.createdAt) - new Date(a.createdAt);
            return 0;
        });


    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <div className="loader">INITIALIZING CAREER INTERFACE...</div>
        </div>
    );

    const isOwner = user?.role === 'admin' || user?.role === 'recruiter';

    return (
        <div className="page-container" style={{ padding: '1.5rem', maxWidth: '100%', height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column' }}>

            {/* Error Message Display */}
            {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '12px', color: '#991b1b', marginBottom: '1.5rem', fontWeight: '700', textAlign: 'center' }}>
                    🚨 {error}
                </div>
            )}

            {/* Extended Filter Bar */}
            <header style={{ marginBottom: '1.5rem', background: 'white', padding: '1.25rem', borderBottom: '2px solid var(--primary)', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '300px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>🔍</span>
                            <input
                                type="text"
                                placeholder="Search by role, organization, or competencies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '500' }}
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="btn-outline"
                            style={{
                                padding: '0 1.5rem', borderRadius: '4px',
                                background: showFilters ? 'var(--primary)' : 'white',
                                color: showFilters ? 'white' : 'var(--text-main)',
                                fontWeight: '850', fontSize: '0.72rem', letterSpacing: '0.5px'
                            }}
                        >
                            {showFilters ? 'HIDE FILTERS' : 'ADVANCED FILTERS'}
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: '850', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SORT ORDER</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                style={{ padding: '0.6rem 1rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: '850', fontSize: '0.72rem', color: 'var(--text-main)', background: 'white', cursor: 'pointer' }}
                            >
                                <option value="DEADLINE_ASC">DEADLINE (SOONEST)</option>
                                <option value="DEADLINE_DESC">DEADLINE (LATEST)</option>
                                <option value="POSTED_DESC">NEWEST POSTS</option>
                            </select>
                        </div>

                        {user?.role === 'admin' && (
                            <button onClick={() => navigate('/create-opportunity')} className="btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.72rem', fontWeight: '850' }}>+ POST OPPORTUNITY</button>
                        )}
                    </div>
                </div>

                {showFilters && (
                    <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '2px dashed #f1f5f9', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)' }}>EMPLOYMENT TYPE</span>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                style={{ padding: '0.6rem 1rem', borderRadius: '10px', border: '2px solid #f1f5f9', fontWeight: '700', fontSize: '0.8rem', background: 'white' }}
                            >
                                <option value="ALL">ALL OPPORTUNITIES</option>
                                <option value="INTERNSHIP">INTERNSHIPS</option>
                                <option value="PLACEMENT">PLACEMENTS</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)' }}>APPLICATION STATUS</span>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{ padding: '0.6rem 1rem', borderRadius: '10px', border: '2px solid #f1f5f9', fontWeight: '700', fontSize: '0.8rem', background: 'white' }}
                            >
                                <option value="ALL">ANY STATUS</option>
                                <option value="OPEN">OPEN / ACTIVE</option>
                                <option value="CLOSED">CLOSED / EXPIRED</option>
                                {user?.role === 'student' && <option value="APPLIED">ALREADY APPLIED</option>}
                                 {user?.role === 'student' && <option value="NOT_APPLIED">NOT APPLIED YET</option>}
                            </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)' }}>VISIBILITY</span>
                            <select
                                value={visibilityFilter}
                                onChange={(e) => setVisibilityFilter(e.target.value)}
                                style={{ padding: '0.6rem 1rem', borderRadius: '10px', border: '2px solid #f1f5f9', fontWeight: '700', fontSize: '0.8rem', background: 'white' }}
                            >
                                <option value="ALL">ALL SCOPES</option>
                                <option value="CAMPUS">CAMPUS ONLY</option>
                                <option value="GLOBAL">GLOBAL OPEN</option>
                            </select>
                        </div>

                        {user?.role === 'admin' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)' }}>VIEW SCOPE</span>
                                <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.3rem', borderRadius: '10px' }}>
                                    <button
                                        onClick={() => setViewScope('mine')}
                                        style={{ padding: '0.4rem 1rem', borderRadius: '8px', border: 'none', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer', background: viewScope === 'mine' ? 'white' : 'transparent', color: viewScope === 'mine' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: viewScope === 'mine' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
                                    >MY POSTS</button>
                                    <button
                                        onClick={() => setViewScope('all')}
                                        style={{ padding: '0.4rem 1rem', borderRadius: '8px', border: 'none', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer', background: viewScope === 'all' ? 'white' : 'transparent', color: viewScope === 'all' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: viewScope === 'all' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
                                    >GLOBAL FEED</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem', flex: 1, overflow: 'hidden' }}>

                {/* Left Pane: Job List */}
                <div className="linways-card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', background: '#fafbff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ fontSize: '0.72rem', fontWeight: '850', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Available Profiles ({filteredJobs.length})</h4>
                            <button onClick={() => { setSearchQuery(''); setTypeFilter('ALL'); setStatusFilter('ALL'); setSortBy('DEADLINE_ASC'); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>Reset</button>
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                        {filteredJobs.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <p style={{ fontWeight: '600' }}>No matching opportunities found.</p>
                            </div>
                        ) : (
                            filteredJobs.map(job => {
                                const expired = isJobExpired(job.deadline);
                                const inactive = !job.isActive || expired;

                                return (
                                    <div
                                        key={job._id}
                                        onClick={() => setSelectedJob(job)}
                                        style={{
                                            padding: '1.25rem',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            marginBottom: '0.5rem',
                                            transition: 'all 0.2s ease',
                                            background: selectedJob?._id === job._id ? 'rgba(0, 43, 91, 0.05)' : 'transparent',
                                            border: selectedJob?._id === job._id ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                                            position: 'relative',
                                            opacity: inactive ? 0.6 : 1,
                                            borderLeft: selectedJob?._id === job._id ? '6px solid var(--primary)' : '1px solid #e2e8f0',
                                        }}
                                    >
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                            <div style={{ width: '40px', height: '40px', background: inactive ? '#e2e8f0' : '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                                🏢
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h5 style={{ fontSize: '0.95rem', fontWeight: '800', color: selectedJob?._id === job._id ? 'var(--primary)' : 'var(--text-main)', marginBottom: '0.25rem' }}>{job.title}</h5>
                                                <p style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>{job.companyName} • {job.location || 'Remote'}</p>
                                                
                                                {/* Match Score Display for Students */}
                                                {user?.role === 'student' && job.matchPercentage !== undefined && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.5rem' }}>
                                                        <div style={{ padding: '2px 6px', borderRadius: '4px', background: job.matchPercentage > 70 ? '#d1fae5' : job.matchPercentage >= 40 ? '#fef3c7' : '#fee2e2', color: job.matchPercentage > 70 ? '#059669' : job.matchPercentage >= 40 ? '#d97706' : '#dc2626', fontSize: '0.65rem', fontWeight: '900' }}>
                                                            {job.matchLabel?.toUpperCase()} • {job.matchPercentage}% MATCH
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: '500' }}>{new Date(job.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            {inactive ? (
                                                <span style={{ fontSize: '0.6rem', fontWeight: '900', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                                                    {expired ? 'EXPIRED' : 'CLOSED'}
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: '0.6rem', fontWeight: '900', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <span style={{ width: '5px', height: '5px', background: 'var(--success)', borderRadius: '50%' }}></span> ACTIVE
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '8px' }}>
                                            <span style={{ 
                                                fontSize: '0.6rem', fontWeight: '900', 
                                                padding: '2px 8px', borderRadius: '4px',
                                                background: job.visibility === 'campus' ? '#f0f9ff' : '#f5f3ff',
                                                color: job.visibility === 'campus' ? '#0369a1' : '#7c3aed',
                                                border: `1px solid ${job.visibility === 'campus' ? '#bae6fd' : '#ddd6fe'}`
                                            }}>
                                                {job.visibility === 'campus' ? '🏠 CAMPUS' : '🌐 GLOBAL'}
                                            </span>
                                            <span style={{ 
                                                fontSize: '0.6rem', fontWeight: '900', 
                                                padding: '2px 8px', borderRadius: '4px',
                                                background: '#f8fafc', color: '#64748b',
                                                border: '1px solid #e2e8f0'
                                            }}>
                                                {job.type?.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right Pane: Job Details */}
                {selectedJob ? (
                    <div className="linways-card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {/* Detail Header */}
                        <div style={{ padding: '2rem', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                    <div style={{ width: '64px', height: '64px', background: '#f8fafc', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', border: '1px solid #e2e8f0' }}>
                                        💼
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.75rem', fontWeight: '950', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{selectedJob.title}</h2>
                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <p style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--primary)' }}>{selectedJob.companyName} | {selectedJob.location || 'Bangalore'}</p>
                                            <span style={{ 
                                                fontSize: '0.7rem', fontWeight: '900', padding: '3px 12px', borderRadius: '999px',
                                                background: selectedJob.visibility === 'campus' ? '#e0f2fe' : '#f3e8ff',
                                                color: selectedJob.visibility === 'campus' ? '#0369a1' : '#7e22ce'
                                            }}>
                                                {selectedJob.visibility === 'campus' ? 'COLLEGE ONLY' : 'GLOBAL OPPORTUNITY'}
                                            </span>
                                            <span style={{ fontSize: '0.7rem', fontWeight: '900', padding: '3px 12px', borderRadius: '999px', background: '#f1f5f9', color: '#475569' }}>
                                                {selectedJob.type?.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>APPLICATION STATUS</p>
                                    {isOwner ? (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => navigate(`/opportunity/${selectedJob._id}/applicants`)}
                                                className="btn-primary"
                                                style={{ padding: '0.6rem 1.25rem', background: '#1e293b' }}
                                            >
                                                📈 VIEW INSIGHTS
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsEditingDeadline(true);
                                                    setNewDeadline(selectedJob.deadline.split('T')[0]);
                                                }}
                                                className="btn-primary"
                                                style={{ padding: '0.6rem 1.25rem' }}
                                            >
                                                🕒 EXTEND
                                            </button>
                                        </div>
                                    ) : (!selectedJob.isActive || isJobExpired(selectedJob.deadline)) ? (
                                        <span className="badge badge-applied" style={{ padding: '6px 16px', fontSize: '0.8rem', background: '#94a3b8', color: 'white' }}>APPLICATIONS CLOSED</span>
                                    ) : selectedJob.isApplied ? (
                                        <span className={`badge badge-${selectedJob.applicationStatus?.toLowerCase() || 'selected'}`} style={{ padding: '6px 16px', fontSize: '0.8rem' }}>
                                            {selectedJob.applicationStatus?.toUpperCase() || 'APPLIED'}
                                        </span>
                                    ) : (
                                        <button className="btn-primary" onClick={() => handleApply(selectedJob._id)} style={{ padding: '0.6rem 2.5rem' }}>APPLY NOW</button>
                                    )}
                                </div>
                            </div>

                            {/* Deadline Editing Bar */}
                            {isEditingDeadline && (
                                <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <label style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--text-muted)' }}>NEW DEADLINE:</label>
                                    <input
                                        type="date"
                                        value={newDeadline}
                                        onChange={(e) => setNewDeadline(e.target.value)}
                                        style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    />
                                    <button onClick={handleUpdateDeadline} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>SAVE</button>
                                    <button onClick={() => setIsEditingDeadline(false)} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontWeight: '700', cursor: 'pointer' }}>CANCEL</button>
                                </div>
                            )}

                            {/* Warning / Status Bar */}
                            {selectedJob.isApplied ? (
                                <div style={{
                                    background: selectedJob.applicationStatus === 'Rejected' ? '#fef2f2' : (selectedJob.applicationStatus === 'Selected' ? '#ecfdf5' : '#f0f9ff'),
                                    border: `1px solid ${selectedJob.applicationStatus === 'Rejected' ? '#fecaca' : (selectedJob.applicationStatus === 'Selected' ? '#6ee7b7' : '#bae6fd')}`,
                                    padding: '0.75rem 1rem',
                                    borderRadius: '8px',
                                    color: selectedJob.applicationStatus === 'Rejected' ? '#991b1b' : (selectedJob.applicationStatus === 'Selected' ? '#065f46' : '#0369a1'),
                                    fontSize: '0.85rem',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span>{selectedJob.applicationStatus === 'Selected' ? '🎉' : (selectedJob.applicationStatus === 'Rejected' ? '❌' : 'ℹ️')}</span>
                                    {selectedJob.applicationStatus === 'Applied' && 'Applied for this job profile. Stay tuned for further updates.'}
                                    {selectedJob.applicationStatus === 'Shortlisted' && `Congratulations! You have been shortlisted for ${selectedJob.currentRound}.`}
                                    {selectedJob.applicationStatus === 'Selected' && 'Congratulations! You have been Selected for this role.'}
                                    {selectedJob.applicationStatus === 'Rejected' && 'Thank you for your interest. We regret to inform you that we are not moving forward with your application.'}
                                    {!['Applied', 'Shortlisted', 'Selected', 'Rejected'].includes(selectedJob.applicationStatus) && `Applied for this job profile. Current Status: ${selectedJob.applicationStatus}`}
                                </div>
                            ) : isJobExpired(selectedJob.deadline) ? (
                                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '0.75rem 1rem', borderRadius: '8px', color: '#991b1b', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>🚨</span> Applications closed - Deadline passed on {new Date(selectedJob.deadline).toLocaleDateString()}.
                                </div>
                            ) : selectedJob.isActive ? (
                                <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '0.75rem 1rem', borderRadius: '8px', color: '#92400e', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>⚠️</span> You have not applied for this Job Profile. Deadline: {new Date(selectedJob.deadline).toLocaleDateString()}
                                </div>
                            ) : (
                                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.75rem 1rem', borderRadius: '8px', color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>
                                    ℹ️ This opportunity is no longer accepting applications.
                                </div>
                            )}
                        </div>

                        {/* Tabs Navigation */}
                        <div style={{ padding: '0 2rem', borderBottom: '2px solid var(--border-color)', display: 'flex', gap: '2rem', background: '#f8fafc' }}>
                            {['description', 'workflow', 'eligibility'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        padding: '1.25rem 0.5rem',
                                        background: 'none',
                                        border: 'none',
                                        borderBottom: activeTab === tab ? '4px solid var(--primary)' : '4px solid transparent',
                                        color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                                        fontWeight: '900',
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {tab === 'description' ? 'JOB OVERVIEW' : tab === 'workflow' ? 'HIRING PROCESS' : 'ELIGIBILITY'}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem', lineHeight: '1.8' }}>
                            {activeTab === 'description' && (
                                <div>
                                    <section style={{ marginBottom: '2.5rem' }}>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            Opening Overview
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                            <div><span style={{ color: 'var(--text-muted)', fontWeight: '800', fontSize: '0.7rem', textTransform: 'uppercase' }}>CATEGORY</span><br /><span style={{ fontWeight: '700', fontSize: '1rem' }}>{selectedJob.type?.toUpperCase()}</span></div>
                                            <div><span style={{ color: 'var(--text-muted)', fontWeight: '800', fontSize: '0.7rem', textTransform: 'uppercase' }}>SALARY/CTC</span><br /><span style={{ fontWeight: '700', fontSize: '1rem' }}>{selectedJob.salary || 'COMPETITIVE'}</span></div>
                                            <div style={{ gridColumn: 'span 2' }}>
                                                <span style={{ color: 'var(--text-muted)', fontWeight: '800', fontSize: '0.7rem', textTransform: 'uppercase' }}>ESSENTIAL COMPETENCIES</span><br />
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                                                    {selectedJob.requiredSkills?.map(s => (
                                                        <span key={s} style={{ padding: '4px 10px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700' }}>{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* ── Semantic Match Breakdown (NLP) ── */}
                                    {user?.role === 'student' && selectedJob.matchPercentage !== undefined && (
                                        <section style={{ marginBottom: '2.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-main)' }}>Semantic Match Intelligence</h4>
                                                <div style={{ fontSize: '1.25rem', fontWeight: '1000', color: selectedJob.matchPercentage > 70 ? 'var(--success)' : (selectedJob.matchPercentage >= 40 ? 'var(--warning)' : 'var(--danger)') }}>
                                                    {selectedJob.matchPercentage}% <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>ACCURACY</span>
                                                </div>
                                            </div>
                                            <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                                <div style={{ marginBottom: '1.5rem' }}>
                                                    <p style={{ fontSize: '0.7rem', fontWeight: '900', color: '#059669', marginBottom: '8px', letterSpacing: '0.5px' }}>✓ MATCHED COMPETENCIES (STEMMED)</p>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                        {selectedJob.matchedSkills?.length > 0 ? selectedJob.matchedSkills.map(s => (
                                                            <span key={s} style={{ padding: '6px 12px', background: '#ecfdf5', color: '#059669', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', border: '1px solid #6ee7b7' }}>{s.toUpperCase()}</span>
                                                        )) : <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No significant semantic overlap detected.</span>}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.7rem', fontWeight: '900', color: '#dc2626', marginBottom: '8px', letterSpacing: '0.5px' }}>⚠ MISSING COMPETENCIES</p>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                        {selectedJob.missingSkills?.length > 0 ? selectedJob.missingSkills.map(s => (
                                                            <span key={s} style={{ padding: '6px 12px', background: '#fff1f2', color: '#dc2626', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', border: '1px solid #fecaca', opacity: 0.8 }}>{s.toUpperCase()}</span>
                                                        )) : <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '700' }}>✓ Full semantic coverage achieved!</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <p style={{ marginTop: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', fontStyle: 'italic' }}>* Intelligence computed via NLP-based vector similarity matching candidate profile roots against institutional requirements.</p>
                                        </section>
                                    )}

                                    <section style={{ marginBottom: '2.5rem' }}>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '1rem' }}>Job Description</h4>
                                        <p style={{ whiteSpace: 'pre-wrap', color: '#4b5563' }}>{selectedJob.jobDescription || 'Detailed job description to be updated soon.'}</p>
                                    </section>

                                    <section>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '1rem' }}>About {selectedJob.companyName}</h4>
                                        <p style={{ whiteSpace: 'pre-wrap', color: '#4b5563' }}>{selectedJob.aboutCompany || 'Company profile information.'}</p>
                                    </section>
                                </div>
                            )}

                            {activeTab === 'workflow' && (
                                <div>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '2rem' }}>Hiring Process Workflow</h4>
                                    <div style={{ paddingLeft: '1.5rem', borderLeft: '3px solid #f1f5f9', position: 'relative' }}>
                                        {selectedJob.hiringWorkflow ? selectedJob.hiringWorkflow.split('\n').map((step, idx) => (
                                            <div key={idx} style={{ marginBottom: '2.5rem', position: 'relative' }}>
                                                <div style={{ position: 'absolute', left: '-27px', top: '0', width: '21px', height: '21px', background: 'white', border: '5px solid var(--primary)', borderRadius: '50%', zIndex: 2 }}></div>
                                                <p style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '1rem' }}>{step}</p>
                                            </div>
                                        )) : (
                                            <p style={{ color: 'var(--text-muted)' }}>Workflow details not provided.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'eligibility' && (
                                <div>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '2rem' }}>Eligibility Criteria</h4>
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {selectedJob.eligibilityCriteria ? selectedJob.eligibilityCriteria.split('\n').map((criterion, idx) => (
                                            <li key={idx} style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                                <span style={{ color: 'var(--success)' }}>✔</span>
                                                <span style={{ fontWeight: '600', color: '#374151' }}>{criterion}</span>
                                            </li>
                                        )) : (
                                            <p style={{ color: 'var(--text-muted)' }}>Standard academic eligibility apply for this drive.</p>
                                        )}
                                        <li style={{ marginTop: '2rem', padding: '1rem', background: '#f0f9ff', borderRadius: '8px', color: '#075985', fontSize: '0.85rem', fontWeight: '600' }}>
                                            ℹ️ Students with active backlogs may not proceed with this application.
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="linways-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                        <div style={{ textAlign: 'center', opacity: 0.5 }}>
                            <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🔎</div>
                            <h3 style={{ fontWeight: '800' }}>SELECT A JOB TO VIEW DETAILS</h3>
                        </div>
                    </div>
                )}
            </div>

            {/* Application Modal */}
            {modal.show && (
                <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', background: 'rgba(30, 27, 75, 0.4)' }} onClick={() => setModal({ ...modal, show: false })}>
                    <div className="modal-content" style={{ padding: '3rem 2.5rem', borderRadius: '24px', maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                            {modal.success ? '🚀' : '🚨'}
                        </div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '950', marginBottom: '1rem', color: 'var(--text-main)', textAlign: 'center' }}>
                            {modal.success ? 'APPLICATION SUBMITTED' : 'SUBMISSION ERROR'}
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6', textAlign: 'center', fontWeight: '600' }}>
                            {modal.message}
                        </p>
                        <button
                            className="btn-primary"
                            style={{ width: '100%', padding: '1.1rem', fontWeight: '900', borderRadius: '14px' }}
                            onClick={() => setModal({ ...modal, show: false })}
                        >
                            ACKNOWLEDGE
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OpportunityList;
