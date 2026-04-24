const Application = require('../application/application.model');
const ApprovalRequest = require('../approval/approval.model');
const Opportunity = require('../opportunity/opportunity.model');
const Student = require('../student/student.model');
const mongoose = require('mongoose');

/**
 * Get overview statistics for the system (Global)
 */
const getOverviewStats = async () => {
    const [
        totalApplications,
        totalShortlisted,
        totalSelected,
        approvalPending,
        approvalCompleted
    ] = await Promise.all([
        Application.countDocuments({}),
        Application.countDocuments({ status: 'SHORTLISTED' }),
        Application.countDocuments({ status: 'SELECTED' }),
        ApprovalRequest.countDocuments({ status: { $ne: 'DEAN_APPROVED' } }),
        ApprovalRequest.countDocuments({ status: 'DEAN_APPROVED' })
    ]);

    const selectionRate = totalApplications > 0 
        ? Math.round((totalSelected / totalApplications) * 100)
        : 0;

    const totalRequests = approvalPending + approvalCompleted;
    const approvalRate = totalRequests > 0 
        ? Math.round((approvalCompleted / totalRequests) * 100)
        : 0;

    return {
        totalApplications,
        totalShortlisted,
        totalSelected,
        approvalPending,
        approvalCompleted,
        selectionRate,
        approvalRate
    };
};

/**
 * Get statistics for Placement Cell
 */
const getPlacementStats = async () => {
    const stats = await getOverviewStats();
    const [totalStudents, totalOpportunities] = await Promise.all([
        Student.countDocuments(),
        Opportunity.countDocuments({ isActive: true })
    ]);

    return {
        ...stats,
        totalStudents,
        activeOpportunities: totalOpportunities
    };
};

/**
 * Get institutional statistics for Admin/Dean/HOD
 */
const getAdminStats = async () => {
    const stats = await getOverviewStats();
    const studentsCount = await Student.countDocuments();
    const activeOpps = await Opportunity.countDocuments({ isActive: true });

    return {
        ...stats,
        pendingRequests: stats.approvalPending,
        completedRequests: stats.approvalCompleted,
        activeOpportunities: activeOpps,
        totalEnrolled: studentsCount
    };
};

/**
 * Get Rich Visual Analytics (Monthly/Semester/Departmental)
 */
const getRichAnalytics = async (query = {}) => {
    const { department } = query;
    
    // 1. Pipeline Breakdown
    const pipelineStats = await Application.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // 2. Departmental Performance (Success Rate)
    const departmentalStats = await Application.aggregate([
        {
            $lookup: {
                from: 'students',
                localField: 'studentId',
                foreignField: '_id',
                as: 'student'
            }
        },
        { $unwind: '$student' },
        {
            $group: {
                _id: '$student.department',
                total: { $sum: 1 },
                selected: {
                    $sum: { $cond: [{ $eq: ['$status', 'SELECTED'] }, 1, 0] }
                }
            }
        },
        {
            $project: {
                department: '$_id',
                successRate: {
                    $cond: [
                        { $eq: ['$total', 0] },
                        0,
                        { $multiply: [{ $divide: ['$selected', '$total'] }, 100] }
                    ]
                },
                totalApplications: '$total'
            }
        }
    ]);

    // 3. Monthly Trends (Last 6 months)
    const monthlyTrends = await Application.aggregate([
        {
            $match: {
                createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
            }
        },
        {
            $group: {
                _id: {
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" }
                },
                applications: { $sum: 1 },
                placements: {
                    $sum: { $cond: [{ $eq: ["$status", "SELECTED"] }, 1, 0] }
                }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // 4. Semester Trends (Custom buckets)
    const semesterTrends = await Application.aggregate([
        {
            $project: {
                month: { $month: "$createdAt" },
                year: { $year: "$createdAt" },
                status: 1
            }
        },
        {
            $project: {
                semester: {
                    $cond: [{ $lte: ["$month", 6] }, "Even (Jan-Jun)", "Odd (Jul-Dec)"],
                },
                year: 1,
                status: 1
            }
        },
        {
            $group: {
                _id: { semester: "$semester", year: "$year" },
                volume: { $sum: 1 },
                placements: {
                    $sum: { $cond: [{ $eq: ["$status", "SELECTED"] }, 1, 0] }
                }
            }
        },
        { $sort: { "_id.year": -1, "_id.semester": 1 } }
    ]);

    return {
        pipeline: pipelineStats.map(p => ({ name: p._id, value: p.count })),
        departmental: departmentalStats.sort((a,b) => b.successRate - a.successRate),
        monthly: monthlyTrends.map(t => ({
            name: `${t._id.month}/${t._id.year}`,
            applications: t.applications,
            placements: t.placements
        })),
        semester: semesterTrends.map(s => ({
            name: `${s._id.semester} ${s._id.year}`,
            volume: s.volume,
            placements: s.placements
        }))
    };
};

module.exports = {
    getOverviewStats,
    getGlobalStats: getOverviewStats,
    getPlacementStats,
    getAdminStats,
    getRichAnalytics
};
