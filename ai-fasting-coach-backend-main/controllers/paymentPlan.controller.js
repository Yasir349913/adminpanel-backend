const { PaymentPlan } = require('../models');
const { StatusCodes } = require('http-status-codes');
const { BadRequest, NotFound } = require('../errors');

// GET /v1/payment-plans
const getPlans = async (req, res) => {
  const { billingType, isActive } = req.query;

  const filter = {};

  if (billingType) {
    filter.billingType = billingType;
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  const plans = await PaymentPlan.find(filter).sort({ createdAt: -1 });

  res.status(StatusCodes.OK).json({
    count: plans.length,
    plans,
  });
};

// POST /v1/payment-plans
const addPlan = async (req, res) => {
  const { title, price, billingType, intervalCount, features } = req.body;
  console.log(req.body);

  if (!title || !price || !billingType || !intervalCount) {
    throw new BadRequest(
      'Please provide title, price, billingType, and intervalCount'
    );
  }

  const plan = await PaymentPlan.create({
    ...req.body,
    features: Array.isArray(features) ? features : [],
  });

  res.status(StatusCodes.CREATED).json(plan);
};

// PATCH /v1/payment-plans/:id
const updatePlan = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const plan = await PaymentPlan.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!plan) {
    throw new NotFound(`No payment plan found with ID: ${id}`);
  }

  res.status(StatusCodes.OK).json(plan);
};

// DELETE /v1/payment-plans/:id
const deletePlan = async (req, res) => {
  const { id } = req.params;

  const plan = await PaymentPlan.findByIdAndDelete(id);
  if (!plan) {
    throw new NotFound(`No payment plan found with ID: ${id}`);
  }

  res
    .status(StatusCodes.OK)
    .json({ message: 'Payment plan deleted successfully' });
};

module.exports = { getPlans, addPlan, updatePlan, deletePlan };
