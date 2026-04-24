import React from 'react';

const CompletionLetterViewer = ({ data }) => {
    const { studentName, rollNumber, department, companyName, role, duration, startDate, endDate } = data;
    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="certificate-container" style={{
            width: '800px',
            margin: '20px auto',
            padding: '60px',
            background: 'white',
            boxShadow: '0 0 20px rgba(0,0,0,0.1)',
            position: 'relative',
            fontFamily: "'Inter', sans-serif",
            border: '20px solid var(--primary)',
            outline: '2px solid #fff',
            outlineOffset: '-10px'
        }}>
            <style>
                {`
                @media print {
                    body * { visibility: hidden; }
                    .certificate-container, .certificate-container * { visibility: visible; }
                    .certificate-container { position: absolute; left: 0; top: 0; box-shadow: none; border: none; }
                    .no-print { display: none !important; }
                }
                `}
            </style>
            
            <button 
                onClick={handlePrint}
                className="btn-primary no-print"
                style={{ position: 'absolute', top: '-50px', right: '0' }}
            >
                PRINT / DOWNLOAD PDF
            </button>

            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '4px', marginBottom: '10px' }}>INSTITUTIONAL PLACEMENT CELL</div>
                <div style={{ height: '2px', background: 'var(--primary)', width: '60%', margin: '0 auto 20px' }}></div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '1000', margin: '20px 0', color: '#1e293b' }}>CERTIFICATE OF COMPLETION</h1>
            </div>

            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#334155', textAlign: 'justify' }}>
                This is to officially certify that <strong>{studentName?.toUpperCase()}</strong> (Roll No: {rollNumber}), 
                a student of the <strong>{department?.toUpperCase()}</strong> department, has successfully completed 
                their industrial training / internship at <strong>{companyName?.toUpperCase()}</strong>.
            </p>

            <div style={{ margin: '30px 0', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr>
                            <td style={tdLabel}>Role/Position</td>
                            <td style={tdValue}>{role}</td>
                        </tr>
                        <tr>
                            <td style={tdLabel}>Duration</td>
                            <td style={tdValue}>{duration}</td>
                        </tr>
                        <tr>
                            <td style={tdLabel}>Period</td>
                            <td style={tdValue}>{new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: '#334155' }}>
                During the course of this internship, the candidate has demonstrated exceptional professional conduct, 
                technical proficiency, and institutional discipline. All performance metrics have been verified and 
                approved by the department faculty mentor.
            </p>

            <div style={{ marginTop: '80px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ borderBottom: '1px solid #000', width: '200px', marginBottom: '10px' }}></div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '800' }}>FACULTY COORDINATOR</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ borderBottom: '1px solid #000', width: '200px', marginBottom: '10px' }}></div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '800' }}>HEAD OF DEPARTMENT</div>
                </div>
            </div>

            <div style={{ position: 'absolute', bottom: '20px', left: '0', right: '0', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Issued on {today} • Document ID: IPMS-{Math.random().toString(36).substr(2, 9).toUpperCase()}
            </div>
        </div>
    );
};

const tdLabel = {
    padding: '10px',
    fontSize: '0.9rem',
    fontWeight: '800',
    color: 'var(--text-muted)',
    width: '30%'
};

const tdValue = {
    padding: '10px',
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--text-main)'
};

export default CompletionLetterViewer;
