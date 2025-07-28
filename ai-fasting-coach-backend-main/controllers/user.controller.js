const { User } = require('../models');
const { USER_ROLES, PAYMENT_STATUS } = require('../utils');
const { twilioClient } = require('../config');
const { env } = require('../config');
const { StatusCodes } = require('http-status-codes');
const { BadRequest, NotFound } = require('../errors');

const registerUserToTwilio = async (name, phone) => {
  const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
  const instructionText = `Send "join thee-bear" to ${env.TWILIO_WHATSAPP_NUMBER} to receive messages`;

  try {
    // Try registering user in Twilio Conversations
    try {
      const user = await twilioClient.conversations.v1.users.create({
        identity: formattedPhone,
        friendlyName: name,
        attributes: JSON.stringify({
          name,
          phone: formattedPhone,
          registeredAt: new Date().toISOString(),
          platform: 'whatsapp',
          sandboxJoined: false,
          instructions: instructionText,
        }),
      });

      return {
        conversationUserSid: user.sid,
        identity: user.identity,
        registered: true,
        sandboxJoined: false,
        instructions: instructionText,
      };
    } catch (conversationError) {
      console.warn(
        '⚠️ Twilio Conversations not available. Falling back to local registration.'
      );
    }
  } catch (error) {
    console.error('❌ Error registering user to Twilio:', error.message);
  }

  return {
    name,
    phone: formattedPhone,
    registered: true,
    sandboxJoined: false,
    platform: 'whatsapp_sandbox',
    instructions: instructionText,
    timestamp: new Date(),
  };
};

// Add user (Create or Update if pending)
const addUser = async (req, res) => {
  console.log(req.body);

  const { name, phone } = req.body;

  if (!name || !phone) {
    throw new BadRequest('Please provide name and phone number');
  }

  const existingUser = await User.findOne({ phone, role: USER_ROLES.USER });

  // Case 1: Already paid
  if (existingUser && existingUser.status === PAYMENT_STATUS.PAID) {
    throw new BadRequest('Phone number already exists');
  }

  // Case 2: Exists with pending status
  if (existingUser && existingUser.status === PAYMENT_STATUS.PENDING) {
    existingUser.name = name;
    await existingUser.save();

    // Register to Twilio when updating from pending to active
    try {
      await registerUserToTwilio(name, phone);
      console.log('User registered to Twilio system');
    } catch (twilioError) {
      console.error(
        'Twilio registration failed but user was updated:',
        twilioError
      );
      // Continue without throwing error since the main operation (user update) succeeded
    }

    return res.status(StatusCodes.OK).json({
      message: 'User already exists with pending status.',
      user: formatUserResponse(existingUser),
    });
  }

  // Case 3: New user
  const newUser = await User.create({
    name,
    phone,
    role: USER_ROLES.USER,
    status: PAYMENT_STATUS.PAID,
  });

  // Register user to Twilio after successful database creation
  try {
    await registerUserToTwilio(name, phone);
    console.log(
      'User successfully added to both database and registered for Twilio'
    );
  } catch (twilioError) {
    console.error(
      'User created in database but Twilio registration failed:',
      twilioError
    );
    // Continue without throwing error since the main operation (user creation) succeeded
  }

  res.status(StatusCodes.CREATED).json({
    message: 'User created successfully',
    user: formatUserResponse(newUser),
  });
};

// Get all users with role "USER"
const getUser = async (req, res) => {
  try {
    const { status, is_subscribed } = req.query;

    const query = { role: USER_ROLES.USER };

    if (status) query.status = status;
    if (is_subscribed !== undefined)
      query.is_subscribed = is_subscribed === 'true';

    const users = await User.find(query);

    res.status(StatusCodes.OK).json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Server error while fetching users.',
    });
  }
};

// Update only 'name', 'status', and 'is_subscribed' fields of user
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, status } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (status) updateData.status = status;

  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new NotFound(`No user found with ID: ${id}`);
  }

  // If status is being updated to PAID, register user to Twilio
  if (status === PAYMENT_STATUS.PAID) {
    try {
      await registerUserToTwilio(user.name, user.phone);
      console.log('Updated user registered to Twilio system');
    } catch (twilioError) {
      console.error(
        'Failed to register updated user with Twilio:',
        twilioError
      );
    }
  }

  res.status(StatusCodes.OK).json({
    message: 'User updated successfully',
    user: formatUserResponse(user),
  });
};

// Helper to format user response
const formatUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  phone: user.phone,
  status: user.status,
});

module.exports = { addUser, getUser, updateUser };
