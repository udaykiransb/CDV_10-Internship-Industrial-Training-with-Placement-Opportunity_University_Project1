import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/api';

const StudentProfile = () => {
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        rollNumber: '',
        department: '',
        year: '',
        skills: '',
        resumeURL: '',
        photoURL: '',
        bio: '',
        linkedIn: '',
        github: '',
        portfolio: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [uploading, setUploading] = useState({ photo: false, resume: false });

    const [editingSection, setEditingSection] = useState(null); // 'personal', 'skills', 'about', 'social'

    const photoInputRef = useRef(null);
    const resumeInputRef = useRef(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/student/profile');
            const data = response.data.data;
            setProfile(data);
            setFormData({
                name: data.name || '',
                rollNumber: data.rollNumber || '',
                department: data.department || '',
                year: data.year || '',
                skills: (data.skills || []).join(', '),
                resumeURL: data.resumeURL || '',
                photoURL: data.photoURL || '',
                bio: data.bio || '',
                linkedIn: data.linkedIn || '',
                github: data.github || '',
                portfolio: data.portfolio || ''
            });
            if (!data.name) setEditingSection('personal');
        } catch (err) {
            if (err.response?.status === 404) {
                setEditingSection('personal');
            } else {
                setError('Failed to fetch profile.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveSection = async (section) => {
        setError('');
        setSuccess('');

        const dataToSend = {
            ...formData,
            skills: formData.skills.split(',').map(s => s.trim()).filter(s => s !== '')
        };

        try {
            if (profile) {
                await api.put('/student/profile', dataToSend);
                setSuccess(`${section.charAt(0).toUpperCase() + section.slice(1)} information updated!`);
            } else {
                await api.post('/student/profile', dataToSend);
                setSuccess('Profile initialized successfully!');
            }
            fetchProfile();
            window.dispatchEvent(new Event('profileUpdated'));
            setEditingSection(null);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save changes.');
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append('photo', file);

        setUploading({ ...uploading, photo: true });
        try {
            const response = await api.post('/student/upload-photo', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const newPhotoURL = response.data.data.photoURL;
            setProfile(prev => ({ ...prev, photoURL: newPhotoURL }));
            setFormData(prev => ({ ...prev, photoURL: newPhotoURL }));
            setSuccess('Profile photo updated!');
            window.dispatchEvent(new Event('profileUpdated'));
        } catch (err) {
            setError('Failed to upload photo.');
        } finally {
            setUploading({ ...uploading, photo: false });
        }
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append('resume', file);

        setUploading({ ...uploading, resume: true });
        try {
            const response = await api.post('/student/upload-resume', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const newResumeURL = response.data.data.resumeURL;
            setProfile(prev => ({ ...prev, resumeURL: newResumeURL }));
            setFormData(prev => ({ ...prev, resumeURL: newResumeURL }));
            setSuccess('Resume uploaded successfully!');
        } catch (err) {
            setError('Failed to upload resume.');
        } finally {
            setUploading({ ...uploading, resume: false });
        }
    };

    const calculateProgress = () => {
        if (!formData.name) return 0;
        let filled = 0;
        const fields = ['name', 'rollNumber', 'department', 'year', 'skills', 'resumeURL', 'photoURL', 'bio', 'linkedIn', 'github'];
        fields.forEach(f => {
            if (formData[f] && (f === 'skills' ? formData[f].length > 0 : true)) filled++;
        });
        return Math.round((filled / fields.length) * 100);
    };

    const getFullURL = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
        const baseURL = apiURL.split('/api/v1')[0];
        return `${baseURL}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="loader">RESTRUCTURING IDENTITY MODELS...</div>
        </div>
    );

    return (
        <div className="page-container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            
            {/* ── Professional Bio/Identity Header ── */}
            <header style={{ marginBottom: '3rem', position: 'relative' }}>
                <div style={{ 
                    height: '220px', 
                    background: 'linear-gradient(135deg, var(--primary) 0%, #1e40af 100%)', 
                    borderRadius: '24px 24px 0 0',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.1, background: 'radial-gradient(circle, #fff 10%, transparent 10.5%)', backgroundSize: '20px 20px' }}></div>
                </div>
                
                <div style={{ padding: '0 3rem', display: 'flex', alignItems: 'flex-end', marginTop: '-80px', position: 'relative', gap: '2.5rem' }}>
                    <div 
                        style={{ 
                            width: '180px', height: '180px', borderRadius: '32px', border: '8px solid white', 
                            background: '#f8fafc', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                            position: 'relative', cursor: 'pointer'
                        }}
                        onClick={() => photoInputRef.current.click()}
                    >
                        {uploading.photo && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>...</div>}
                        {profile?.photoURL ? (
                            <img src={getFullURL(profile.photoURL)} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', fontWeight: '900', color: 'var(--primary)' }}>
                                {profile?.name ? profile.name.charAt(0).toUpperCase() : '?'}
                            </div>
                        )}
                        <input type="file" ref={photoInputRef} style={{ display: 'none' }} accept="image/*" onChange={handlePhotoUpload} />
                    </div>

                    <div style={{ flex: 1, paddingBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h1 style={{ fontSize: '2.5rem', fontWeight: '1000', color: 'var(--text-main)', letterSpacing: '-1px', marginBottom: '4px' }}>
                                    {profile?.name?.toUpperCase() || 'IDENTITY PENDING'}
                                </h1>
                                <p style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--primary)', letterSpacing: '0.5px' }}>
                                    {profile?.department?.toUpperCase()} • CLASS OF {new Date().getFullYear() + (4 - (profile?.year || 0))}
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {profile?.linkedIn && <a href={profile.linkedIn} target="_blank" rel="noreferrer" style={{ width: '40px', height: '40px', background: '#0077b5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none', fontWeight: '900' }}>in</a>}
                                    {profile?.github && <a href={profile.github} target="_blank" rel="noreferrer" style={{ width: '40px', height: '40px', background: '#24292e', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none', fontWeight: '900' }}>git</a>}
                                    <button 
                                        onClick={() => setEditingSection('social')}
                                        style={{ width: '40px', height: '40px', background: '#f1f5f9', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '1rem' }}
                                    >🔗</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {success && <div className="alert alert-success" style={{ marginBottom: '2rem', borderLeft: '5px solid #10b981' }}>{success}</div>}
            {error && <div className="alert alert-error" style={{ marginBottom: '2rem', borderLeft: '5px solid #ef4444' }}>{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem' }}>
                <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* ── Professional Bio ── */}
                    <section className="linways-card" style={{ padding: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: '900', letterSpacing: '0.5px' }}>PROFESSIONAL SUMMARY</h4>
                            <button onClick={() => setEditingSection('about')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>✏️ EDIT BIO</button>
                        </div>
                        {editingSection === 'about' ? (
                            <div>
                                <textarea 
                                    name="bio" 
                                    value={formData.bio} 
                                    onChange={handleChange} 
                                    placeholder="Briefly describe your career objectives and technical focus..."
                                    style={{ width: '100%', minHeight: '150px', padding: '1rem', borderRadius: '16px', border: '2px solid #e2e8f0', fontFamily: 'inherit', fontSize: '0.95rem' }}
                                />
                                <div style={{ marginTop: '1rem', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                    <button onClick={() => setEditingSection(null)} className="btn-outline">CANCEL</button>
                                    <button onClick={() => handleSaveSection('about')} className="btn-primary">SAVE SUMMARY</button>
                                </div>
                            </div>
                        ) : (
                            <p style={{ fontSize: '1.1rem', color: '#4b5563', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                                {profile?.bio || 'No professional summary set. Click the edit button to define your digital identity.'}
                            </p>
                        )}
                    </section>

                    {/* ── Skills & Competencies ── */}
                    <section className="linways-card" style={{ padding: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: '900', letterSpacing: '0.5px' }}>CORE COMPETENCIES</h4>
                            <button onClick={() => setEditingSection('skills')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>✏️ UPDATE SKILLS</button>
                        </div>
                        {editingSection === 'skills' ? (
                            <div>
                                <input 
                                    type="text" 
                                    name="skills" 
                                    value={formData.skills} 
                                    onChange={handleChange} 
                                    placeholder="e.g. React, Node.js, Python, AWS..."
                                    style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '2px solid #e2e8f0' }}
                                />
                                <div style={{ marginTop: '1rem', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                    <button onClick={() => setEditingSection(null)} className="btn-outline">CANCEL</button>
                                    <button onClick={() => handleSaveSection('skills')} className="btn-primary">SAVE COMPETENCIES</button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                {profile?.skills?.map(skill => (
                                    <span key={skill} style={{ 
                                        padding: '10px 20px', background: '#f1f5f9', color: 'var(--primary)', 
                                        borderRadius: '12px', fontSize: '0.85rem', fontWeight: '900', border: '1px solid #e2e8f0',
                                        transition: 'all 0.2s hover', textTransform: 'uppercase'
                                    }}>{skill}</span>
                                ))}
                            </div>
                        )}
                    </section>
                </main>

                <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* ── Stats & Progress ── */}
                    <div className="linways-card" style={{ padding: '2rem' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>IDENTITY COMPLETION</h4>
                        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1.5rem' }}>
                            <svg width="120" height="120" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="54" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                                <circle 
                                    cx="60" cy="60" r="54" fill="none" stroke="var(--primary)" strokeWidth="12"
                                    strokeDasharray="339" strokeDashoffset={339 - (339 * calculateProgress() / 100)}
                                    strokeLinecap="round" transform="rotate(-90 60 60)"
                                />
                            </svg>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '1000', color: 'var(--primary)' }}>
                                {calculateProgress()}%
                            </div>
                        </div>
                        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                           {calculateProgress() < 100 ? 'Complete your profile to increase match accuracy.' : 'Optimal profile strength achieved.'}
                        </p>
                    </div>

                    {/* ── Documents ── */}
                    <div className="linways-card" style={{ padding: '2rem' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>OFFICIAL DOCUMENTS</h4>
                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                            <p style={{ fontWeight: '900', fontSize: '0.9rem', marginBottom: '4px' }}>VERIFIED RESUME</p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800', marginBottom: '1rem' }}>PDF FORMAT • LATEST SYNC</p>
                            {profile?.resumeURL ? (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <a href={getFullURL(profile.resumeURL)} target="_blank" rel="noreferrer" className="btn-primary" style={{ flex: 1, padding: '8px', fontSize: '0.7rem' }}>VIEW</a>
                                    <button onClick={() => resumeInputRef.current.click()} className="btn-outline" style={{ flex: 1, padding: '8px', fontSize: '0.7rem' }}>UPDATE</button>
                                </div>
                            ) : (
                                <button onClick={() => resumeInputRef.current.click()} className="btn-primary" style={{ width: '100%', padding: '10px' }}>UPLOAD RESUME</button>
                            )}
                            <input type="file" ref={resumeInputRef} style={{ display: 'none' }} accept=".pdf" onChange={handleResumeUpload} />
                        </div>
                    </div>
                </aside>
            </div>

            {/* ── Social/About Modals (Simplified as sections here) ── */}
            {editingSection === 'social' && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="linways-card" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem' }}>
                        <h4 style={{ fontSize: '1.5rem', fontWeight: '1000', marginBottom: '2rem', letterSpacing: '-0.5px' }}>CONNECT ACCOUNTS</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label style={{ fontWeight: '800', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>LINKEDIN URL</label>
                                <input type="text" name="linkedIn" value={formData.linkedIn} onChange={handleChange} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '2px solid #f1f5f9' }} />
                            </div>
                            <div className="form-group">
                                <label style={{ fontWeight: '800', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>GITHUB URL</label>
                                <input type="text" name="github" value={formData.github} onChange={handleChange} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '2px solid #f1f5f9' }} />
                            </div>
                            <div className="form-group">
                                <label style={{ fontWeight: '800', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>PORTFOLIO URL</label>
                                <input type="text" name="portfolio" value={formData.portfolio} onChange={handleChange} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '2px solid #f1f5f9' }} />
                            </div>
                        </div>
                        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '10px' }}>
                            <button onClick={() => setEditingSection(null)} className="btn-outline" style={{ flex: 1 }}>CANCEL</button>
                            <button onClick={() => handleSaveSection('social')} className="btn-primary" style={{ flex: 1 }}>SAVE CONNECTIONS</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Editing Personal Details Modal */}
            {editingSection === 'personal' && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="linways-card" style={{ maxWidth: '600px', width: '100%', padding: '2.5rem' }}>
                        <h4 style={{ fontSize: '1.5rem', fontWeight: '1000', marginBottom: '2rem', letterSpacing: '-0.5px' }}>ACADEMIC CREDENTIALS</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label style={{ fontWeight: '800', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>FULL NAME</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '2px solid #f1f5f9' }} />
                            </div>
                            <div className="form-group">
                                <label style={{ fontWeight: '800', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>ROLL NUMBER</label>
                                <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} disabled={!!profile} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '2px solid #f1f5f9', background: profile ? '#f8fafc' : 'white' }} />
                            </div>
                            <div className="form-group">
                                <label style={{ fontWeight: '800', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>DEPARTMENT</label>
                                <input type="text" name="department" value={formData.department} onChange={handleChange} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '2px solid #f1f5f9' }} />
                            </div>
                            <div className="form-group">
                                <label style={{ fontWeight: '800', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>YEAR OF STUDY</label>
                                <select name="year" value={formData.year} onChange={handleChange} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '2px solid #f1f5f9', background: 'white' }}>
                                    <option value="">Select...</option>
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '10px' }}>
                            <button onClick={() => setEditingSection(null)} className="btn-outline" style={{ flex: 1 }}>CANCEL</button>
                            <button onClick={() => handleSaveSection('personal')} className="btn-primary" style={{ flex: 1 }}>SAVE CREDENTIALS</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentProfile;
