const express = require('express');
const router = express.Router();
const exportController = require('./export.controller');
const protect = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/role.middleware');

// Root: /api/v1/export
// Protected: Restricted to leadership roles
router.use(protect);
router.use(authorize(['admin', 'dean', 'hod', 'coordinator']));

router.get('/students', exportController.exportStudents);
router.get('/applicants/:opportunityId', exportController.exportApplicants);

module.exports = router;
