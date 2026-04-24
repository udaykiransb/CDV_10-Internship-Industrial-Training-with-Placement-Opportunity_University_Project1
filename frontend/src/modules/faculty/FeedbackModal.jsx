import React, { useState } from 'react';

const FeedbackModal = ({ isOpen, onClose, onSubmit, studentName, company }) => {
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(5);
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        await onSubmit(feedback);
        setSubmitting(false);
        onClose();
    };

    return (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(10px)', background: 'rgba(30,27,75,0.6)', zIndex: 1000 }} onClick={onClose}>
            <div className="modal-content" style={{ maxWidth: '600px', padding: '3rem', borderRadius: '32px' }} onClick={e => e.stopPropagation()}>
                <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '950', color: 'var(--primary)', marginBottom: '0.5rem' }}>PERFORMANCE EVALUATION</h2>
                    <p style={{ color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.9rem' }}>
                        Providing feedback for <strong>{studentName}</strong> for their internship at <strong>{company}</strong>.
                    </p>
                </header>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                            QUALITATIVE ASSESSMENT (FACULTY MENTOR FEEDBACK)
                        </label>
                        <textarea
                            required
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="e.g. The student demonstrated exceptional technical growth and professional conduct..."
                            rows={6}
                            style={{
                                width: '100%', padding: '1.25rem', borderRadius: '16px', border: '2px solid #e2e8f0',
                                fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical', background: '#f8fafc'
                            }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <button type="button" onClick={onClose} className="btn-outline" style={{ padding: '1rem', fontWeight: '900', borderRadius: '16px' }}>
                            CANCEL
                        </button>
                        <button type="submit" disabled={submitting} className="btn-primary" style={{ padding: '1rem', fontWeight: '900', borderRadius: '16px' }}>
                            {submitting ? 'SUBMITTING...' : 'FINALIZE EVALUATION'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeedbackModal;
