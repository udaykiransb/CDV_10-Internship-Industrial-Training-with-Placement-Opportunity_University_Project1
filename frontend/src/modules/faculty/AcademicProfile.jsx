import React, { useState, useEffect } from 'react';
import api from '../../api/api';

const AcademicProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/faculty/profile');
                setProfile(res.data.data);
            } catch (err) {
                console.error('Error fetching academic profile', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="loader">FETCHING ACADEMIC PROFILE...</div>
        </div>
    );

    if (!profile) return <div style={{ padding: '2rem' }}>Profile not found. Please ensure your account is set up as faculty.</div>;

    const designations = profile.designations || ['mentor'];

    return (
        <div className="page-container" style={{ padding: '2.5rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2.5rem', borderBottom: '2px solid var(--primary)', paddingBottom: '1.25rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-0.5px', textTransform: 'uppercase', marginBottom: '0.25rem' }}>OFFICIAL ACADEMIC PROFILE</h1>
                <p style={{ color: 'var(--text-muted)', fontWeight: '800', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Institutional Leadership & Faculty Credentials</p>
            </div>

            <div className="linways-profile-banner" style={{ marginBottom: '2.5rem' }}>
                <div className="linways-avatar-container">
                    <div className="linways-avatar-inner" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #1e40af 100%)' }}>
                        {profile?.facultyName?.charAt(0) || 'F'}
                    </div>
                </div>
                <div className="linways-profile-details">
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        {designations.map(d => (
                            <span key={d} style={{ 
                                background: 'rgba(255,255,255,0.2)', color: '#fff', 
                                padding: '2px 10px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.5px' 
                            }}>
                                {d.toUpperCase()}
                            </span>
                        ))}
                    </div>
                    <h2 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>{profile.facultyName?.toUpperCase()}</h2>
                    <div style={{ display: 'flex', gap: '2rem', opacity: 0.9, fontSize: '0.95rem', flexWrap: 'wrap' }}>
                        <p><strong>DEPARTMENT:</strong>&nbsp;{profile.department?.toUpperCase()}</p>
                        <p><strong>OFFICIAL EMAIL:</strong>&nbsp;{profile.email}</p>
                        <p><strong>OFFICE:</strong>&nbsp;Main Building, Room 402</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2.5rem' }}>
                {/* Main Info */}
                <main>
                    <section style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: '1000', color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></span>
                            BIO & PROFESSIONAL SUMMARY
                        </h3>
                        <div className="linways-card" style={{ padding: '2rem', lineHeight: '1.7', color: 'var(--text-main)', fontWeight: '500' }}>
                            Professional faculty member in the {profile.department} department, managing academic growth and student mentorship. Currently fulfilling active roles as {designations.join(', ')} within the institution.
                        </div>
                    </section>

                    <section>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: '1000', color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></span>
                            ACADEMIC DESIGNATIONS
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            {designations.map(d => (
                                <div key={d} className="linways-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.25rem' }}>
                                        {d === 'hod' ? '🏢' : d === 'coordinator' ? '🎯' : '👨‍🏫'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '900', color: 'var(--text-main)', fontSize: '0.95rem' }}>{d.toUpperCase()}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Active Designation</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>

                {/* Sidebar Stats */}
                <aside>
                    <div className="linways-card" style={{ padding: '2rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '1.5rem', letterSpacing: '1px' }}>QUICK CONTACT</h4>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Email Address</div>
                            <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9rem' }}>{profile.email}</div>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Office Location</div>
                            <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9rem' }}>Main Building, Room 402</div>
                        </div>
                        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '2rem 0' }} />
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '1.5rem', letterSpacing: '1px' }}>METRICS</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '1000', color: 'var(--primary)' }}>24</div>
                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', lineHeight: '1.2' }}>STUDENTS<br/>MENTORED</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '1000', color: '#10b981' }}>12</div>
                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', lineHeight: '1.2' }}>INTERNSHIPS<br/>APPROVED</div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default AcademicProfile;
