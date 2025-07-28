const express = require('express');
const {
  getReviews,
  addReview,
  updateReview,
  deleteReview,
} = require('../controllers');
const { authMiddleware, adminOnly } = require('../middleware');

const router = express.Router();

router.route('/').get(getReviews);
// Apply auth + admin middleware to all review routes
router.use(authMiddleware, adminOnly);
router.route('/').post(addReview);
router.route('/:id').patch(updateReview).delete(deleteReview);

module.exports = router;
