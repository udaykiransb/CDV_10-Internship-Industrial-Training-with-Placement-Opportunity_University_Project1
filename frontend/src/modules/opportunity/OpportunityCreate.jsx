import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

const OpportunityCreate = () => {
    const [formData, setFormData] = useState({
        title: '',
        companyName: '',
        aboutCompany: '',
        jobDescription: '',
        hiringWorkflow: '',
        location: '',
        salary: '',
        eligibilityCriteria: '',
        type: 'internship',
        visibility: 'campus',
        requiredSkills: '',
        deadline: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const dataToSend = {
            ...formData,
            type: formData.type.toLowerCase(),
            visibility: formData.visibility.toLowerCase(),
            requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(s => s !== '')
        };

        try {
            await api.post('/opportunity', dataToSend);
            navigate('/opportunities');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create opportunity.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            <div className="linways-card" style={{ padding: '3.5rem', borderTop: '6px solid var(--primary)' }}>
                <div style={{ marginBottom: '3rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '950', color: 'var(--primary)', letterSpacing: '-0.5px', textTransform: 'uppercase' }}>OFFICIAL OPPORTUNITY POSTING</h2>
                    <p style={{ color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.4rem' }}>National Internship & Placement Registry Entry</p>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '0.5rem' }}>
                    {error && <div className="alert alert-error" style={{ marginBottom: '2rem', fontWeight: '700' }}>{error}</div>}

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label style={{ fontWeight: '900', fontSize: '0.7rem', color: 'var(--primary)', marginBottom: '0.75rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>JOB TITLE / POSITION</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. SOFTWARE ENGINEER INTERN"
                            required
                            style={{ padding: '0.8rem 1.1rem', borderRadius: '4px', border: '2px solid #e2e8f0', fontWeight: '700', fontSize: '0.9rem' }}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div className="form-group">
                            <label style={{ fontWeight: '900', fontSize: '0.7rem', color: 'var(--primary)', marginBottom: '0.75rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>RECRUITING COMPANY</label>
                            <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                placeholder="e.g. GOOGLE INDIA PVT LTD"
                                required
                                style={{ padding: '0.8rem 1.1rem', borderRadius: '4px', border: '2px solid #e2e8f0', fontWeight: '700', width: '100%', fontSize: '0.9rem' }}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ fontWeight: '900', fontSize: '0.7rem', color: 'var(--primary)', marginBottom: '0.75rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>OFFICE LOCATION</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g. BANGALORE / REMOTE"
                                required
                                style={{ padding: '0.8rem 1.1rem', borderRadius: '4px', border: '2px solid #e2e8f0', fontWeight: '700', width: '100%', fontSize: '0.9rem' }}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label style={{ fontWeight: '900', fontSize: '0.7rem', color: 'var(--primary)', marginBottom: '0.75rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ABOUT THE COMPANY</label>
                        <textarea
                            name="aboutCompany"
                            value={formData.aboutCompany}
                            onChange={handleChange}
                            placeholder="Brief description of the organization and its culture..."
                            required
                            rows="4"
                            style={{ width: '100%', padding: '1rem', borderRadius: '4px', border: '2px solid #e2e8f0', fontWeight: '600', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.9rem' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div className="form-group">
                            <label style={{ fontWeight: '900', fontSize: '0.7rem', color: 'var(--primary)', marginBottom: '0.75rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>OPPORTUNITY CLASSIFICATION</label>
                            <select name="type" value={formData.type} onChange={handleChange} style={{ padding: '0.8rem 1.1rem', borderRadius: '4px', border: '2px solid #e2e8f0', fontWeight: '700', width: '100%', background: 'white', fontSize: '0.9rem' }}>
                                <option value="internship">INTERNSHIP OPPORTUNITY</option>
                                <option value="placement">CAREER PLACEMENT</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label style={{ fontWeight: '900', fontSize: '0.7rem', color: 'var(--primary)', marginBottom: '0.75rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>VISIBILITY JURISDICTION</label>
                            <select name="visibility" value={formData.visibility} onChange={handleChange} style={{ padding: '0.8rem 1.1rem', borderRadius: '4px', border: '2px solid #e2e8f0', fontWeight: '700', width: '100%', background: 'white', fontSize: '0.9rem' }}>
                                <option value="campus">COLLEGE / CAMPUS ONLY</option>
                                <option value="global">GLOBAL / OPEN ENROLLMENT</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontWeight: '900', fontSize: '0.7rem', color: 'var(--primary)', marginBottom: '0.75rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ANNUAL CTC / MONTHLY STIPEND</label>
                            <input
                                type="text"
                                name="salary"
                                value={formData.salary}
                                onChange={handleChange}
                                placeholder="e.g. 12 LPA or 25,000/MONTH"
                                style={{ padding: '0.8rem 1.1rem', borderRadius: '4px', border: '2px solid #e2e8f0', fontWeight: '700', width: '100%', fontSize: '0.9rem' }}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label style={{ fontWeight: '900', fontSize: '0.7rem', color: 'var(--primary)', marginBottom: '0.75rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DETAILED JOB SPECIFICATIONS</label>
                        <textarea
                            name="jobDescription"
                            value={formData.jobDescription}
                            onChange={handleChange}
                            placeholder="Provide comprehensive details regarding roles, responsibilities, and technical expectations..."
                            required
                            rows="6"
                            style={{ width: '100%', padding: '1rem', borderRadius: '4px', border: '2px solid #e2e8f0', fontWeight: '600', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.9rem' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label style={{ fontWeight: '900', fontSize: '0.7rem', color: 'var(--primary)', marginBottom: '0.75rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>OFFICIAL RECRUITMENT WORKFLOW</label>
                        <textarea
                            name="hiringWorkflow"
                            value={formData.hiringWorkflow}
                            onChange={handleChange}
                            placeholder="1. INITIAL SCREENING -> 2. TECHNICAL ASSESSMENT -> 3. BOARD INTERVIEW"
                            required
                            rows="4"
                            style={{ width: '100%', padding: '1rem', borderRadius: '4px', border: '2px solid #e2e8f0', fontWeight: '600', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.9rem' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label style={{ fontWeight: '900', fontSize: '0.7rem', color: 'var(--primary)', marginBottom: '0.75rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ADHERENCE / ELIGIBILITY CRITERIA</label>
                        <textarea
                            name="eligibilityCriteria"
                            value={formData.eligibilityCriteria}
                            onChange={handleChange}
                            placeholder="e.g. MIN 7.5 CGPA, NO ACTIVE BACKLOGS, CSE/ISE BRANCHES ONLY..."
                            rows="4"
                            style={{ width: '100%', padding: '1rem', borderRadius: '4px', border: '2px solid #e2e8f0', fontWeight: '600', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.9rem' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div className="form-group">
                            <label style={{ fontWeight: '900', fontSize: '0.7rem', color: 'var(--primary)', marginBottom: '0.75rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>APPLICATION SUBMISSION DEADLINE</label>
                            <input
                                type="date"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleChange}
                                required
                                style={{ padding: '0.8rem 1.1rem', borderRadius: '4px', border: '2px solid #e2e8f0', fontWeight: '700', width: '100%', background: 'white', fontSize: '0.9rem' }}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ fontWeight: '900', fontSize: '0.7rem', color: 'var(--primary)', marginBottom: '0.75rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>REQUIRED TECHNICAL COMPETENCIES (COMMA SEPARATED)</label>
                            <input
                                type="text"
                                name="requiredSkills"
                                value={formData.requiredSkills}
                                onChange={handleChange}
                                placeholder="e.g. REACT, NODE.JS, CLOUD ARCHITECTURE"
                                style={{ padding: '0.8rem 1.1rem', borderRadius: '4px', border: '2px solid #e2e8f0', fontWeight: '700', width: '100%', fontSize: '0.9rem' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '3rem', display: 'flex', gap: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '2.5rem' }}>
                        <button
                            type="button"
                            className="btn-outline"
                            style={{ flex: 1, fontWeight: '850', padding: '1rem', fontSize: '0.85rem' }}
                            onClick={() => navigate(-1)}
                        >
                            DISCARD DRAFT
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ flex: 1.5, fontWeight: '850', padding: '1rem', letterSpacing: '1px', fontSize: '0.85rem' }}
                            disabled={loading}
                        >
                            {loading ? 'PROCESSING...' : 'INITIALIZE OFFICIAL LISTING'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OpportunityCreate;
