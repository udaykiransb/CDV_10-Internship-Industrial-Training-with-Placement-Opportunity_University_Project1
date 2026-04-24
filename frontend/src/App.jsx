import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Login from './Login';
import Register from './Register';
import StudentProfile from './modules/student/StudentProfile';
import MyApplications from './modules/student/MyApplications';
import OpportunityList from './modules/opportunity/OpportunityList';
import OpportunityCreate from './modules/opportunity/OpportunityCreate';
import OpportunityApplicants from './modules/opportunity/OpportunityApplicants';
import NotificationsPage from './modules/notifications/NotificationsPage';
import './index.css';

import Layout from './components/Layout';
import StudentDashboard from './modules/student/StudentDashboard';
import AdminDashboard from './modules/placement-cell/AdminDashboard';
import FacultyDashboard from './modules/faculty/FacultyDashboard';
import CoordinatorDashboard from './modules/faculty/CoordinatorDashboard';
import HODDashboard from './modules/faculty/HODDashboard';
import DeanDashboard from './modules/faculty/DeanDashboard';
import AcademicProfile from './modules/faculty/AcademicProfile';
import RecruiterDashboard from './modules/recruiter/RecruiterDashboard';

// New portal components
import PortalSelector from './modules/student/PortalSelector';
import InternshipDashboard from './modules/student/InternshipDashboard';
import AnalyticsDashboard from './modules/analytics/AnalyticsDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" />;
    }

    return children;
};

// Dispatcher component to show correct dashboard based on role
// For students, show PortalSelector. Other roles see their dashboards directly.
const DashboardDispatcher = () => {
    const { user } = useAuth();

    if (user?.role === 'admin') return <AdminDashboard />;
    if (user?.role === 'recruiter') return <RecruiterDashboard />;
    
    // Centralize all academic levels into the Faculty Hub
    const academicRoles = ['faculty', 'coordinator', 'hod', 'dean'];
    if (academicRoles.includes(user?.role)) return <FacultyDashboard />;

    // Students see the portal selector on "/"
    return <PortalSelector />;
};

function App() {
    return (
        <AuthProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <div className="App">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        <Route
                            path="/*"
                            element={
                                <ProtectedRoute>
                                    <NotificationProvider>
                                        <Layout>
                                            <Routes>
                                                <Route path="/" element={<DashboardDispatcher />} />
                                                <Route path="/opportunities/:id?" element={<OpportunityList />} />
                                                <Route path="/notifications" element={<NotificationsPage />} />
                                                <Route
                                                    path="/profile"
                                                    element={
                                                        <ProtectedRoute allowedRoles={['student']}>
                                                            <StudentProfile />
                                                        </ProtectedRoute>
                                                    }
                                                />
                                                <Route
                                                    path="/my-applications"
                                                    element={
                                                        <ProtectedRoute allowedRoles={['student']}>
                                                            <MyApplications />
                                                        </ProtectedRoute>
                                                    }
                                                />
                                                <Route
                                                    path="/create-opportunity"
                                                    element={
                                                        <ProtectedRoute allowedRoles={['admin', 'recruiter']}>
                                                            <OpportunityCreate />
                                                        </ProtectedRoute>
                                                    }
                                                />
                                                <Route
                                                    path="/opportunity/:id/applicants"
                                                    element={
                                                        <ProtectedRoute allowedRoles={['admin', 'recruiter']}>
                                                            <OpportunityApplicants />
                                                        </ProtectedRoute>
                                                    }
                                                />

                                                {/* ── Placement Portal ── */}
                                                <Route
                                                    path="/placement"
                                                    element={
                                                        <ProtectedRoute allowedRoles={['student']}>
                                                            <StudentDashboard />
                                                        </ProtectedRoute>
                                                    }
                                                />

                                                {/* ── Internship Portal ── */}
                                                <Route
                                                    path="/internship"
                                                    element={
                                                        <ProtectedRoute allowedRoles={['student']}>
                                                            <InternshipDashboard />
                                                        </ProtectedRoute>
                                                    }
                                                />

                                                {/* ── Academic Profiles ── */}
                                                <Route
                                                    path="/academic-profile"
                                                    element={
                                                        <ProtectedRoute allowedRoles={['faculty', 'coordinator', 'hod', 'dean']}>
                                                            <AcademicProfile />
                                                        </ProtectedRoute>
                                                    }
                                                />
                                                <Route
                                                    path="/analytics"
                                                    element={
                                                        <ProtectedRoute allowedRoles={['admin', 'dean', 'hod', 'coordinator']}>
                                                            <AnalyticsDashboard />
                                                        </ProtectedRoute>
                                                    }
                                                />
                                            </Routes>
                                        </Layout>
                                    </NotificationProvider>
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
