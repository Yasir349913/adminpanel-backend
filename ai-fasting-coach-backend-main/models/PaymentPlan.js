const mongoose = require('mongoose');
const { PRICING_TYPE } = require('../utils');

const PaymentPlanSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    billingType: {
      type: String,
      enum: Object.values(PRICING_TYPE),
      required: true,
    },
    features: {
      type: [String],
      default: [],
    },
    intervalCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentPlan', PaymentPlanSchema);
