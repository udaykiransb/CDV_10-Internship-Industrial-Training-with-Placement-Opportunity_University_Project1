import React from 'react';

const ApplicationJourney = ({ currentLevel, finalStatus, approvalFlow }) => {
    const steps = [
        { key: 'FACULTY', label: 'Faculty Approval', icon: '👨‍🏫', flowKey: 'faculty' },
        { key: 'COORDINATOR', label: 'Coordinator', icon: '📋', flowKey: 'coordinator' },
        { key: 'HOD', label: 'Department Head', icon: '🎓', flowKey: 'hod' },
        { key: 'DEAN', label: 'Dean / Executive', icon: '🏛️', flowKey: 'dean' },
        { key: 'COMPLETED', label: 'NOC Issued', icon: '📜', flowKey: null }
    ];

    const getStatusColor = (step, index) => {
        if (finalStatus === 'REJECTED') {
            // Find where it was rejected
            const levels = ['FACULTY', 'COORDINATOR', 'HOD', 'DEAN'];
            const rejectionIndex = levels.indexOf(currentLevel);
            if (index === rejectionIndex) return '#ef4444'; // Red for the rejected level
            if (index < rejectionIndex) return '#10b981'; // Green for past levels
            return '#e2e8f0'; // Gray for future
        }

        if (currentLevel === 'COMPLETED') return '#10b981';

        const levels = ['FACULTY', 'COORDINATOR', 'HOD', 'DEAN', 'COMPLETED'];
        const currentIndex = levels.indexOf(currentLevel);

        if (index < currentIndex) return '#10b981'; // Green
        if (index === currentIndex) return 'var(--primary)'; // Blue
        return '#e2e8f0'; // Light Gray
    };

    return (
        <div style={{ padding: '2rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                {/* Connecting Line */}
                <div style={{
                    position: 'absolute', top: '24px', left: '5%', right: '5%',
                    height: '4px', background: '#f1f5f9', zIndex: 1
                }}>
                    <div style={{
                        height: '100%',
                        background: finalStatus === 'REJECTED' ? '#ef4444' : 'var(--primary)',
                        width: currentLevel === 'COMPLETED' ? '100%' : `${(['FACULTY', 'COORDINATOR', 'HOD', 'DEAN', 'COMPLETED'].indexOf(currentLevel) / (steps.length - 1)) * 100}%`,
                        transition: 'width 0.5s ease-in-out'
                    }}></div>
                </div>

                {steps.map((step, index) => {
                    const color = getStatusColor(step, index);
                    const isCurrent = currentLevel === step.key;
                    const isCompleted = getStatusColor(step, index) === '#10b981';

                    return (
                        <div key={step.key} style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20%' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '16px',
                                background: isCurrent ? 'white' : color,
                                border: isCurrent ? `4px solid ${color}` : 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.2rem', boxShadow: isCurrent ? '0 10px 20px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.3s ease'
                            }}>
                                {isCompleted ? '✓' : step.icon}
                            </div>
                            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                <p style={{
                                    fontSize: '0.75rem', fontWeight: '900',
                                    color: isCurrent ? 'var(--text-main)' : 'var(--text-muted)',
                                    textTransform: 'uppercase', letterSpacing: '0.5px'
                                }}>{step.label}</p>
                                {approvalFlow && step.flowKey && (approvalFlow[step.flowKey]?.status === 'REJECTED' || approvalFlow[step.flowKey]?.status === 'Rejected') && (
                                    <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: '800' }}>REJECTED</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ApplicationJourney;
