const { User } = require('../models');
const { StatusCodes } = require('http-status-codes');
const { BadRequest, Unauthenticated } = require('../errors');
const { USER_ROLES } = require('../utils');

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequest('Please provide email and password');
  }

  const user = await User.findOne({ email, role: USER_ROLES.ADMIN });
  if (!user) {
    throw new Unauthenticated('Invalid Credentials');
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new Unauthenticated('Invalid Credentials');
  }

  const token = user.createJWT();

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.status;
  delete userObj.messages;

  res.status(StatusCodes.OK).json({
    user: userObj,
    accessToken: token,
  });
};

module.exports = { login };
