const express = require('express');
const { getPlans, addPlan, updatePlan, deletePlan } = require('../controllers');
const { authMiddleware, adminOnly } = require('../middleware');

const router = express.Router();

router.route('/').get(getPlans);

// Apply auth + admin protection to all routes
router.use(authMiddleware, adminOnly);
router.route('/').post(addPlan);
router.route('/:id').patch(updatePlan).delete(deletePlan);

module.exports = router;
