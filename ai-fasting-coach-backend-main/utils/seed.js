const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, PaymentPlan, Review } = require('../models/index');
const { USER_ROLES, PAYMENT_STATUS } = require('../utils/enums');
const { env } = require('../config/index');

const seedAdmin = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to MongoDB......');

    // admin
    const existingAdmin = await User.findOne({
      email: env.ADMIN_EMAIL,
      role: USER_ROLES.ADMIN,
    });

    if (existingAdmin) {
      console.log('Admin already exists...');
    } else {
      const hashedPassword = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
      await User.create({
        name: 'Admin',
        email: env.ADMIN_EMAIL,
        password: hashedPassword,
        role: USER_ROLES.ADMIN,
      });
      console.log('Admin created...');
    }

    // Payment Plans
    const plans = await PaymentPlan.countDocuments();
    if (plans === 0) {
      await PaymentPlan.insertMany([
        {
          title: 'Monthly AI Coach Plan',
          description: '1 month of guided AI fasting support',
          price: 9.99,
          billingType: PAYMENT_STATUS.MONTHLY || 'monthly',
          intervalCount: 1,
          features: [
            'WhatsApp AI Coach',
            'Daily motivation',
            'Pre/Post fast check-ins',
          ],
        },
        {
          title: 'Annual AI Coach Plan',
          description: 'Full year with discounted rate',
          price: 99.99,
          billingType: PAYMENT_STATUS.YEARLY || 'yearly',
          intervalCount: 1,
          features: [
            'Everything in Monthly',
            'Priority Support',
            'Bonus coaching session',
          ],
        },
      ]);
      console.log('Payment plans seeded...');
    } else {
      console.log('Payment plans already exist...');
    }

    // Reviews
    const reviews = await Review.countDocuments();
    if (reviews === 0) {
      await Review.insertMany([
        {
          name: 'Ayesha Khan',
          message: 'The fasting coach kept me on track — best decision!',
          rating: 5,
        },
        {
          name: 'Omar Farooq',
          message: 'Great experience. The AI messages helped me stay strong.',
          rating: 4,
        },
        {
          name: 'Fatima Malik',
          message: 'Highly recommend for anyone doing 72-hour fasting.',
          rating: 5,
        },
      ]);
      console.log('Reviews seeded...');
    } else {
      console.log('Reviews already exist...');
    }

    process.exit();
  } catch (err) {
    console.error('Error during seed:', err);
    process.exit(1);
  }
};

seedAdmin();
