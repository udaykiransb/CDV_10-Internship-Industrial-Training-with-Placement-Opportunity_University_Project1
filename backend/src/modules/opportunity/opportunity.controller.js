const opportunityService = require('./opportunity.service');
const studentService = require('../student/student.service');

/**
 * Controller to create opportunity (Admin/Recruiter)
 */
const create = async (req, res, next) => {
    try {
        const { title, companyName, type, requiredSkills, deadline } = req.body;

        if (!title || !companyName || !type || !deadline) {
            return res.status(400).json({
                success: false,
                message: 'Required fields: title, companyName, type, deadline',
            });
        }

        const opportunity = await opportunityService.createOpportunity(req.body, req.user.id);

        res.status(201).json({
            success: true,
            message: 'Opportunity created successfully',
            data: opportunity,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller to list opportunities
 * - Students see only active ones
 * - Admins/Recruiters see all
 */
const list = async (req, res, next) => {
    try {
        let opportunities;
        const { mine } = req.query;

        if (req.user.role === 'student') {
            const student = await studentService.getProfile(req.user.id);
            if (student) {
                opportunities = await opportunityService.listActiveOpportunitiesWithStatus(student._id, student.skills);
            } else {
                opportunities = await opportunityService.listActiveOpportunities();
            }
        } else if (mine === 'true' || req.user.role === 'recruiter') {
            // recruiters always see their own by default, admins can choose
            opportunities = await opportunityService.listOpportunitiesByUser(req.user.id);
        } else {
            // admins see all by default if mine isnt true
            opportunities = await opportunityService.listAllOpportunities();
        }

        console.log(`Opportunity List Fetch [Role: ${req.user.role}, UserID: ${req.user.id}, Mine: ${mine}]`);
        console.log(`Found ${opportunities.length} opportunities`);

        res.status(200).json({
            success: true,
            data: opportunities,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller to get sorted student feed with match %
 */
const getStudentFeed = async (req, res, next) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const student = await studentService.getProfile(req.user.id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student profile not found' });
        }

        const opportunities = await opportunityService.listStudentFeed(student._id, student.skills);

        res.status(200).json({
            success: true,
            data: opportunities,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller to update opportunity
 */
const update = async (req, res, next) => {
    try {
        const opportunity = await opportunityService.updateOpportunity(req.params.id, req.body);

        if (!opportunity) {
            return res.status(404).json({ success: false, message: 'Opportunity not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Opportunity updated successfully',
            data: opportunity,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller to soft delete opportunity
 */
const remove = async (req, res, next) => {
    try {
        const opportunity = await opportunityService.softDeleteOpportunity(req.params.id);

        if (!opportunity) {
            return res.status(404).json({ success: false, message: 'Opportunity not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Opportunity deactivated (soft-deleted) successfully',
            data: opportunity,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller to get opportunity by ID
 */
const getById = async (req, res, next) => {
    try {
        const opportunity = await opportunityService.getOpportunityById(req.params.id);

        if (!opportunity) {
            return res.status(404).json({ success: false, message: 'Opportunity not found' });
        }

        res.status(200).json({
            success: true,
            data: opportunity,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    create,
    list,
    update,
    remove,
    getById,
    getStudentFeed,
};
