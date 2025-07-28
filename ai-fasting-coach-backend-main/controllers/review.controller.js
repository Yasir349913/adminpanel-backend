const { Review } = require('../models');
const { StatusCodes } = require('http-status-codes');
const { BadRequest, NotFound } = require('../errors');

// GET /v1/reviews
const getReviews = async (req, res) => {
  const reviews = await Review.find().sort({ createdAt: -1 });
  res.status(StatusCodes.OK).json({ count: reviews.length, reviews });
};

// POST /v1/reviews
const addReview = async (req, res) => {
  const { name, message, rating } = req.body;

  if (!name || !message || !rating) {
    throw new BadRequest('Please provide name, message, and rating');
  }

  const review = await Review.create({ name, message, rating });
  res.status(StatusCodes.CREATED).json(review);
};

// PATCH /v1/reviews/:id
const updateReview = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const review = await Review.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!review) {
    throw new NotFound(`No review found with ID: ${id}`);
  }

  res.status(StatusCodes.OK).json(review);
};

// DELETE /v1/reviews/:id
const deleteReview = async (req, res) => {
  const { id } = req.params;

  const review = await Review.findByIdAndDelete(id);

  if (!review) {
    throw new NotFound(`No review found with ID: ${id}`);
  }

  res.status(StatusCodes.OK).json({ message: 'Review deleted successfully' });
};

module.exports = { getReviews, addReview, updateReview, deleteReview };
