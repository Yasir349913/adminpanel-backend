const express = require('express');

const authRoutes = require('./authRoutes');
const paymentPlanRoutes = require('./paymentPlanRoutes');
const reviewRoutes = require('./reviewRoutes');
const twilioRoutes = require('./twilioRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/payment-plans', paymentPlanRoutes);
router.use('/reviews', reviewRoutes);
router.use('/twilio', twilioRoutes);
router.use('/user', userRoutes);

module.exports = router;
