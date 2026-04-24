import React from 'react';

const NOCViewer = ({ data }) => {
    if (!data) return null;

    const { student, internship, institute, certificateId, date } = data;

    return (
        <div style={{ 
            padding: '4rem', 
            background: 'white', 
            color: '#1a1a1a', 
            fontFamily: '"Times New Roman", Times, serif',
            lineHeight: '1.6',
            width: '100%',
            maxWidth: '850px',
            margin: '0 auto',
            border: '20px solid #f8fafc',
            boxShadow: '0 0 50px rgba(0,0,0,0.05)',
            position: 'relative'
        }}>
            {/* Watermark */}
            <div style={{ 
                position: 'absolute', inset: 0, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontSize: '8rem', fontWeight: '900', color: 'rgba(0,43,91,0.03)', 
                transform: 'rotate(-45deg)', pointerEvents: 'none', zIndex: 0
            }}>
                INSTITUTIONAL
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <header style={{ textAlign: 'center', borderBottom: '2px solid #002b5b', paddingBottom: '2rem', marginBottom: '3rem' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#002b5b', letterSpacing: '2px', marginBottom: '0.5rem' }}>
                        {institute.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b' }}>
                        {institute.location}
                    </div>
                </header>

                {/* Sub-Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4rem', fontSize: '0.9rem', fontWeight: '700' }}>
                    <div>Ref: {certificateId}</div>
                    <div>Date: {date}</div>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '900', textDecoration: 'underline', color: '#002b5b' }}>NO OBJECTION CERTIFICATE</h1>
                </div>

                {/* Body Content */}
                <section style={{ fontSize: '1.15rem', textAlign: 'justify', marginBottom: '4rem' }}>
                    <p style={{ marginBottom: '1.5rem' }}>
                        This is to certify that <strong>Mr./Ms. {student.name}</strong>, bearing Roll Number <strong>{student.rollNumber}</strong>, 
                        is a bonafide student of the <strong>{student.department}</strong> department, currently in their {student.year === 1 ? '1st' : student.year === 2 ? '2nd' : student.year === 3 ? '3rd' : '4th'} year of study at this institute.
                    </p>
                    <p style={{ marginBottom: '1.5rem' }}>
                        The Institute has <strong>No Objection</strong> to the aforementioned student pursuing an internship/placement opportunity with 
                        <strong> {internship.company}</strong> in the role of <strong>{internship.role}</strong>.
                    </p>
                    <p>
                        We believe this opportunity will contribute significantly to the student's professional development and technical proficiency. 
                        The student is permitted to participate in the internship program as per the academic regulations of the university.
                    </p>
                </section>

                {/* Closing */}
                <div style={{ marginTop: '8rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ textAlign: 'center', width: '250px' }}>
                        <div style={{ borderBottom: '1px solid #1a1a1a', marginBottom: '0.5rem', height: '40px' }}></div>
                        <div style={{ fontWeight: '900', fontSize: '1rem' }}>{institute.authority}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Institutional Approval Authority</div>
                    </div>
                </div>

                {/* Footer Stamp area */}
                <div style={{ marginTop: '4rem', opacity: 0.1, fontSize: '0.7rem' }}>
                    * This is a computer-generated document verified by the Institutional Management System.
                </div>
            </div>
            
            <style>
                {`
                    @media print {
                        body * { visibility: hidden; }
                        .noc-printable, .noc-printable * { visibility: visible; }
                        .noc-printable { position: absolute; left: 0; top: 0; width: 100%; }
                    }
                `}
            </style>
        </div>
    );
};

export default NOCViewer;
