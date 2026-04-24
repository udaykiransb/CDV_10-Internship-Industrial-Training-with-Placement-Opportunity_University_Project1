const express = require('express');
const router = express.Router();
const documentService = require('./document.service');
const authMiddleware = require('../../middlewares/auth.middleware');

/**
 * Controller for documents
 */
const getDocumentData = async (req, res, next) => {
    try {
        const { type, applicationId } = req.params;
        let data;
        
        if (type === 'noc') {
            data = await documentService.getNOCData(applicationId);
        } else if (type === 'completion') {
            data = await documentService.getCompletionData(applicationId);
        } else {
            return res.status(400).json({ success: false, message: 'Invalid document type' });
        }

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/v1/document/:type/:applicationId
// @desc    Get data for official letters (noc/completion)
// @access  Private (Self or Admin/Faculty)
router.get('/:type/:applicationId', authMiddleware, getDocumentData);

module.exports = router;
