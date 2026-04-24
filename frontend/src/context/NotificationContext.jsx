import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    // Persist read/cleared state locally
    const [actionHistory, setActionHistory] = useState(() => {
        const saved = localStorage.getItem('notification_actions');
        return saved ? JSON.parse(saved) : { readIds: [], clearedIds: [] };
    });

    useEffect(() => {
        localStorage.setItem('notification_actions', JSON.stringify(actionHistory));
    }, [actionHistory]);

    const generateNotifications = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            let generated = [];
            const now = new Date();

            if (user.role === 'student') {
                // Fetch context data
                const [oppsRes, appsRes, profileRes] = await Promise.all([
                    api.get('/opportunity'),
                    api.get('/application/my'),
                    api.get('/student/profile')
                ]);

                const opportunities = oppsRes.data.data || [];
                const applications = appsRes.data.data || [];
                const profile = profileRes.data.data || {};

                // 1. New Opportunities (last 7 days, matching skills if possible)
                const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                opportunities.filter(o => new Date(o.createdAt) > sevenDaysAgo).forEach(o => {
                    const matchesSkill = profile.skills?.some(s => o.requiredSkills?.some(rs => rs.toLowerCase() === s.toLowerCase()));
                    generated.push({
                        id: `opp-new-${o._id}`,
                        icon: '🆕',
                        message: `New ${o.type} posted: ${o.title} at ${o.companyName}`,
                        time: 'Recently',
                        type: matchesSkill ? 'NEW' : 'INFO',
                        timestamp: new Date(o.createdAt).getTime()
                    });
                });

                // 2. Upcoming Deadlines (within 5 days)
                const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
                opportunities.filter(o => {
                    const deadline = new Date(o.deadline);
                    return deadline > now && deadline < fiveDaysFromNow;
                }).forEach(o => {
                    generated.push({
                        id: `opp-deadline-${o._id}`,
                        icon: '⏰',
                        message: `Deadline approaching: ${o.title} at ${o.companyName}`,
                        time: 'Urgent',
                        type: 'URGENT',
                        timestamp: new Date(o.deadline).getTime() - 1 // Sort slightly before deadline
                    });
                });

                // 3. Application Updates
                applications.filter(a => a.status !== 'Applied').forEach(a => {
                    generated.push({
                        id: `app-update-${a._id}-${a.status}`,
                        icon: '⭐',
                        message: `Application for ${a.opportunityId?.companyName || 'Job'} updated to: ${a.status}`,
                        time: 'Update',
                        type: 'UPDATE',
                        timestamp: new Date(a.updatedAt).getTime()
                    });
                });

                // 4. Recently Applied
                applications.filter(a => new Date(a.createdAt) > sevenDaysAgo).forEach(a => {
                    generated.push({
                        id: `app-success-${a._id}`,
                        icon: '✅',
                        message: `Successfully applied for ${a.opportunityId?.title} at ${a.opportunityId?.companyName}`,
                        time: 'Success',
                        type: 'SUCCESS',
                        timestamp: new Date(a.createdAt).getTime()
                    });
                });

                // 5. Profile Check
                if (!profile.resume) {
                    generated.push({
                        id: 'profile-resume-missing',
                        icon: '📋',
                        message: 'Complete your profile: Upload your resume to improve chances',
                        time: 'Action Required',
                        type: 'INFO',
                        timestamp: now.getTime()
                    });
                }
                if (!profile.skills || profile.skills.length === 0) {
                    generated.push({
                        id: 'profile-skills-missing',
                        icon: '💡',
                        message: 'Add your skills to get personalized recommendations',
                        time: 'Action Required',
                        type: 'INFO',
                        timestamp: now.getTime() - 1000
                    });
                }
            } else {
                // Logic for Academic Roles (Faculty, Coordinator, HOD, Dean)
                const academicRoles = ['faculty', 'coordinator', 'hod', 'dean'];
                
                if (academicRoles.includes(user.role)) {
                    try {
                        const rolePath = user.role.toLowerCase();
                        const endpoint = rolePath === 'faculty' ? '/faculty/pending-approvals' : `/${rolePath}/internship-requests`;
                        const res = await api.get(endpoint);
                        const pendingApps = res.data.data || [];

                        pendingApps.forEach(app => {
                            const studentName = app.studentId?.name || 'A student';
                            const company = app.companyName || app.opportunityId?.companyName || 'an internship';
                            
                            generated.push({
                                id: `pending-approval-${app._id}-${user.role}`,
                                icon: '⏳',
                                message: `Pending Approval: ${studentName} for ${company}`,
                                time: 'Action Required',
                                type: 'URGENT',
                                timestamp: new Date(app.updatedAt || app.createdAt).getTime()
                            });
                        });
                    } catch (err) {
                        console.error(`Failed to fetch notifications for ${user.role}:`, err);
                    }
                }

                // Generic logic for other roles or fetch role-specific data if available
                try {
                    const oppsRes = await api.get('/opportunity');
                    const opportunities = oppsRes.data.data || [];
                    
                    if (user.role === 'recruiter') {
                        const myOpps = opportunities.filter(o => o.postedBy === user.id);
                        generated.push({
                            id: 'recruiter-overview',
                            icon: '📊',
                            message: `You have ${myOpps.length} active job postings`,
                            time: 'Overview',
                            type: 'INFO',
                            timestamp: now.getTime()
                        });
                    } else if (user.role === 'admin') {
                        generated.push({
                            id: 'admin-overview',
                            icon: '⚖️',
                            message: `System Monitoring: ${opportunities.length} total opportunities active`,
                            time: 'Update',
                            type: 'INFO',
                            timestamp: now.getTime()
                        });
                    }
                } catch (err) {
                    // Fallback if /opportunity fails (e.g. for roles that don't have access yet, though we fixed this for faculty)
                    console.warn('Opportunity fetch failed for notification context');
                }
            }

            // Filter out cleared notifications and apply read status
            const finalNotifications = generated
                .filter(n => !actionHistory.clearedIds.includes(n.id))
                .map(n => ({
                    ...n,
                    read: actionHistory.readIds.includes(n.id)
                }))
                .sort((a, b) => b.timestamp - a.timestamp);

            setNotifications(finalNotifications);
        } catch (error) {
            console.error('Failed to generate notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [user, actionHistory]);

    useEffect(() => {
        generateNotifications();
        // Refresh every 5 minutes
        const interval = setInterval(generateNotifications, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [generateNotifications]);

    const markRead = (id) => {
        setActionHistory(prev => ({
            ...prev,
            readIds: [...new Set([...prev.readIds, id])]
        }));
    };

    const markAllRead = () => {
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        setActionHistory(prev => ({
            ...prev,
            readIds: [...new Set([...prev.readIds, ...unreadIds])]
        }));
    };

    const clearAll = () => {
        const currentIds = notifications.map(n => n.id);
        setActionHistory(prev => ({
            ...prev,
            clearedIds: [...new Set([...prev.clearedIds, ...currentIds])]
        }));
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            markRead,
            markAllRead,
            clearAll,
            refresh: generateNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
