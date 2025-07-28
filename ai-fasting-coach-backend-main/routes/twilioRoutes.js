const express = require('express');
const { subscribeOnly } = require('../middleware');
const { handleIncomingMessage, sendQRCode } = require('../controllers');
const router = express.Router();

router.use(subscribeOnly);
router.route('/webhook').post(handleIncomingMessage);
router.route('/qr').post(sendQRCode);

module.exports = router;
