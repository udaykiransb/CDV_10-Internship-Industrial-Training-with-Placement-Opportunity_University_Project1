const analyticsService = require('./analytics.service');

/**
 * Controller to get combined dashboard stats
 */
const getGlobalStats = async (req, res, next) => {
    try {
        const stats = await analyticsService.getGlobalStats();
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get detailed visual analytics (trends, depts, etc)
 */
const getRichAnalytics = async (req, res, next) => {
    try {
        const stats = await analyticsService.getRichAnalytics(req.query);
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller specifically for Placement Cell Dashboard
 */
const getPlacementStats = async (req, res, next) => {
    try {
        const stats = await analyticsService.getPlacementStats();
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller specifically for Admin/Dean Dashboard
 */
const getAdminStats = async (req, res, next) => {
    try {
        const stats = await analyticsService.getAdminStats();
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getGlobalStats,
    getPlacementStats,
    getAdminStats,
    getRichAnalytics
};
