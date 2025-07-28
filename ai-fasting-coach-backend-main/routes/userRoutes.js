const express = require('express');
const { addUser, getUser, updateUser } = require('../controllers');
const { authMiddleware, adminOnly } = require('../middleware');

const router = express.Router();

router.route('/').post(addUser);

router.use(authMiddleware, adminOnly);
router.route('/').get(getUser);
router.route('/:id').patch(updateUser);

module.exports = router;
