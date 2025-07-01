const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaign.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware')
// فقط الـ Owner ينشئ حملة
router.post('/', authenticate, authorize('owner'), campaignController.createCampaign);

// فقط الـ Admin يجيب كل الحملات
router.get('/', authenticate, authorize('system_admin'), campaignController.getAllCampaigns);

module.exports = router;
