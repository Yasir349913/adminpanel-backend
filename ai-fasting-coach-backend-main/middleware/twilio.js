const { User } = require('../models');
const { PAYMENT_STATUS } = require('../utils');
const { BadRequest, Unauthenticated } = require('../errors');

const subscribeOnly = async (req, res, next) => {
  try {
    const from = req.body.From; // whatsapp:+1234567890
    const phone = from?.split(':')[1]; //+1234567890

    if (!phone) {
      throw new BadRequest('Invalid phone number');
    }

    const user = await User.findOne({ phone });

    if (!user) {
      throw new Unauthenticated('Phone number does not exist.');
    }

    if (user.status === PAYMENT_STATUS.PENDING) {
      throw new Unauthenticated('Subscription is pending. Access denied.');
    }

    next();
  } catch (error) {
    next(new BadRequest(error.message || 'Access denied.'));
  }
};

module.exports = { subscribeOnly };
