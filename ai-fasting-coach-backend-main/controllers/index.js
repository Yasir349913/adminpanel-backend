const { login } = require('./auth.controller');
const {
  getPlans,
  addPlan,
  updatePlan,
  deletePlan,
} = require('./paymentPlan.controller');
const {
  getReviews,
  addReview,
  updateReview,
  deleteReview,
} = require('./review.controller');
const { handleIncomingMessage, sendQRCode } = require('./twillio.controller');
const { addUser, getUser, updateUser } = require('./user.controller');

module.exports = {
  login,
  getPlans,
  addPlan,
  updatePlan,
  deletePlan,
  getReviews,
  addReview,
  updateReview,
  deleteReview,
  handleIncomingMessage,
  sendQRCode,
  addUser,
  getUser,
  updateUser,
};
