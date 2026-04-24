import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const currentPath = location.pathname;
    
    // Determine active portal based on current path
    const isPlacementPath = currentPath.startsWith('/placement') || currentPath.includes('type=PLACEMENT');
    const isInternshipPath = currentPath.startsWith('/internship') || currentPath.includes('type=INTERNSHIP');

    // Navigation Items
    const commonStudentItems = [
        { path: '/', label: 'Portal Select', icon: '🏠' },
        { path: '/profile', label: 'Profile', icon: '👤' },
        { path: '/notifications', label: 'Notifications', icon: '🔔' },
    ];

    const studentPlacementMenu = [
        { path: '/placement', label: 'Placement Hub', icon: '📊' },
        { path: '/opportunities?type=PLACEMENT', label: 'Job Openings', icon: '💼' },
        { path: '/my-applications?type=PLACEMENT', label: 'My Applications', icon: '📂' },
        { path: '/internship', label: 'Switch to Internships', icon: '🎓', secondary: true },
    ];

    const studentInternshipMenu = [
        { path: '/internship', label: 'Internship Hub', icon: '📊' },
        { path: '/opportunities?type=INTERNSHIP', label: 'Internship Openings', icon: '💼' },
        { path: '/my-applications?type=INTERNSHIP', label: 'Approval History', icon: '📂' },
        { path: '/placement', label: 'Switch to Placements', icon: '💼', secondary: true },
    ];

    const studentDefaultMenu = [
        { path: '/placement', label: 'Placement Portal', icon: '💼' },
        { path: '/internship', label: 'Internship Portal', icon: '🎓' },
    ];

    const menuItems = {
        student: isPlacementPath 
            ? [...commonStudentItems.slice(0,1), ...studentPlacementMenu, ...commonStudentItems.slice(1)]
            : isInternshipPath
                ? [...commonStudentItems.slice(0,1), ...studentInternshipMenu, ...commonStudentItems.slice(1)]
                : [...commonStudentItems, ...studentDefaultMenu],
        recruiter: [
            { path: '/', label: 'Overview', icon: '📊' },
            { path: '/opportunities', label: 'Offerings', icon: '📄' },
            { path: '/create-opportunity', label: 'Draft Posting', icon: '➕' },
            { path: '/notifications', label: 'Alerts', icon: '🔔' },
        ],
        admin: [
            { path: '/', label: 'Institute Stats', icon: '📊' },
            { path: '/analytics', label: 'Analytics Hub', icon: '📈' },
            { path: '/opportunities', label: 'All Postings', icon: '📋' },
            { path: '/create-opportunity', label: 'New Listing', icon: '🆕' },
            { path: '/notifications', label: 'Alert Center', icon: '🔔' },
        ],
        faculty: [
            { path: '/', label: 'Professional Hub', icon: '🎓' },
            { path: '/academic-profile', label: 'My Credentials', icon: '👤' },
            { path: '/opportunities', label: 'Engagement Center', icon: '🏢' },
            { path: '/notifications', label: 'Institutional Alerts', icon: '🔔' },
        ],
        coordinator: [
            { path: '/', label: 'Coordinator Hub', icon: '🎓' },
            { path: '/academic-profile', label: 'Portal Profile', icon: '👤' },
            { path: '/my-applications', label: 'Approval History', icon: '📜' },
            { path: '/notifications', label: 'System Alerts', icon: '🔔' },
        ],
        hod: [
            { path: '/', label: 'Department Hub', icon: '🎓' },
            { path: '/academic-profile', label: 'HOD Profile', icon: '👤' },
            { path: '/my-applications', label: 'Dept History', icon: '📜' },
            { path: '/notifications', label: 'Admin Alerts', icon: '🔔' },
        ],
        dean: [
            { path: '/', label: 'Executive Hub', icon: '🎓' },
            { path: '/academic-profile', label: 'Executive Profile', icon: '👤' },
            { path: '/my-applications', label: 'Final Approvals', icon: '📜' },
            { path: '/notifications', label: 'Executive Alerts', icon: '🔔' },
        ]
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const currentMenu = menuItems[user?.role] || [];

    const portalLabel = isPlacementPath ? 'Placement' : isInternshipPath ? 'Internship' : null;

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo-icon">🏛️</div>
                <div>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: '850', letterSpacing: '0.05em' }}>MAIN NAVIGATOR</h3>
                    {portalLabel && (
                        <span style={{
                            fontSize: '0.6rem',
                            fontWeight: '900',
                            letterSpacing: '1px',
                            color: 'var(--primary)',
                            background: 'white',
                            padding: '2px 8px',
                            borderRadius: '2px',
                            textTransform: 'uppercase',
                            marginTop: '4px',
                            display: 'inline-block'
                        }}>
                            {portalLabel} SECTOR
                        </span>
                    )}
                </div>
            </div>

            <nav className="sidebar-menu">
                <ul>
                    {currentMenu.map((item) => (
                        <li key={item.path + item.label} className={item.secondary ? 'secondary-nav-item' : ''}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => isActive ? 'active' : ''}
                                onClick={() => window.innerWidth <= 768 && setIsOpen(false)}
                                end={item.path === '/'}
                            >
                                <span className="menu-icon" style={{ fontSize: '1.4rem' }}>{item.icon}</span>
                                <span className="menu-text">{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-btn-sidebar">
                    <span className="menu-icon" style={{ fontSize: '1.2rem' }}>🔌</span>
                    <span className="menu-text">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
