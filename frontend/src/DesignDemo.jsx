import React from 'react';
import './demo.css';

const DesignDemo = () => {
  return (
    <div className="demo-wrapper">
      {/* Header */}
      <header className="demo-header">
        <div className="demo-logo-section">
          <div className="demo-logo-placeholder">🏛️</div>
          <div className="demo-portal-title">
            <h1>National Internship & Placement Portal</h1>
            <p>Department of Institutional Excellence • Government of Information</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#003366' }}>🇮🇳 English | हिंदी</span>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>JD</div>
        </div>
      </header>

      <div className="demo-main">
        {/* Sidebar */}
        <aside className="demo-sidebar">
          <div className="demo-sidebar-card">
            <div className="demo-sidebar-header">QUICK NAVIGATION</div>
            <ul className="demo-nav-list">
              <li className="demo-nav-item active">📊 Dashboard Overview</li>
              <li className="demo-nav-item">💼 Opportunity Feed</li>
              <li className="demo-nav-item">📝 My Applications</li>
              <li className="demo-nav-item">👤 Professional Profile</li>
              <li className="demo-nav-item">📜 Certificate Vault</li>
              <li className="demo-nav-item">⚙️ Account Settings</li>
            </ul>
          </div>

          <div className="demo-sidebar-card" style={{ marginTop: '1.5rem', background: '#fffbeb', border: '1px solid #fef3c7' }}>
            <div style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#92400e', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Important Notice</div>
              <p style={{ fontSize: '0.8rem', color: '#92400e', margin: 0, lineHeight: '1.4' }}>
                Please ensure your Aadhaar or institutional ID is verified to access government-sponsored internships.
              </p>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="demo-content">
          <div className="demo-breadcrumb">Home / Dashboards / Student Overview</div>
          
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#003366', marginBottom: '2rem' }}>Welcome, John Doe</h2>

          {/* Stats */}
          <div className="demo-stats-grid">
            <div className="demo-stat-card">
              <div className="demo-stat-title">Active Applications</div>
              <div className="demo-stat-value">12</div>
            </div>
            <div className="demo-stat-card">
              <div className="demo-stat-title">Shortlisted</div>
              <div className="demo-stat-value">04</div>
            </div>
            <div className="demo-stat-card">
              <div className="demo-stat-title">Interviews Scheduled</div>
              <div className="demo-stat-value">02</div>
            </div>
            <div className="demo-stat-card">
              <div className="demo-stat-title">Placed / Completed</div>
              <div className="demo-stat-value">01</div>
            </div>
          </div>

          {/* Table */}
          <div className="demo-section-card">
            <div className="demo-section-header">
              <h3>Recent Internship Opportunities</h3>
              <button className="demo-btn-primary">View All Posts</button>
            </div>
            <table className="demo-table">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Company / Department</th>
                  <th>Role</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>#INT-8821</td>
                  <td><strong>Bharat Electronics Ltd.</strong></td>
                  <td>Software Engineering Intern</td>
                  <td>6 Months</td>
                  <td><span className="demo-status-pill status-active">Open</span></td>
                  <td><button style={{ color: '#003366', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>View Details</button></td>
                </tr>
                <tr>
                  <td>#INT-7742</td>
                  <td><strong>National Informatics Center</strong></td>
                  <td>Data Analyst Trainee</td>
                  <td>3 Months</td>
                  <td><span className="demo-status-pill status-active">Open</span></td>
                  <td><button style={{ color: '#003366', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>View Details</button></td>
                </tr>
                <tr>
                  <td>#INT-9910</td>
                  <td><strong>ISRO - Space Application</strong></td>
                  <td>ML Research Intern</td>
                  <td>1 Year</td>
                  <td><span className="demo-status-pill status-pending">Shortlisting</span></td>
                  <td><button style={{ color: '#003366', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Check Status</button></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Form Sample */}
          <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
             <div className="demo-section-card">
                <div className="demo-section-header">
                  <h3>Sample Search / Filter</h3>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.4rem', color: '#64748b' }}>SEARCH BY KEYWORD</label>
                    <input type="text" placeholder="e.g. Python, Digital Marketing..." style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1dce5', borderRadius: '4px' }} />
                  </div>
                  <button className="demo-btn-primary" style={{ width: '100%' }}>APPLY FILTERS</button>
                </div>
             </div>
             
             <div style={{ background: '#003366', borderRadius: '4px', padding: '2rem', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '1.25rem' }}>Professional Support</h4>
                <p style={{ opacity: 0.8, fontSize: '0.9rem', marginBottom: '1.5rem' }}>Need help with the portal? Access our 24/7 helpdesk for institutional students.</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button style={{ background: 'white', color: '#003366', border: 'none', padding: '0.6rem 1rem', borderRadius: '4px', fontWeight: 700 }}>Contact Helpdesk</button>
                  <button style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid white', padding: '0.6rem 1rem', borderRadius: '4px', fontWeight: 700 }}>Read FAQs</button>
                </div>
             </div>
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <footer style={{ marginTop: '4rem', padding: '2rem', textAlign: 'center', borderTop: '1px solid #d1dce5', color: '#64748b', fontSize: '0.8rem' }}>
        <p>© 2026 National Internship & Placement Portal. Managed by Department of Higher Education.</p>
        <p style={{ marginTop: '0.5rem' }}>Accessibility · Privacy Policy · Terms of Service · Grievance Redressal</p>
      </footer>
    </div>
  );
};

export default DesignDemo;
