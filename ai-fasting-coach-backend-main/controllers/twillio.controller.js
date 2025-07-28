const { generateReply } = require('../utils');
const { twilioClient } = require('../config');
const { env } = require('../config');
const { User } = require('../models');
const QRCode = require('qrcode');
const { StatusCodes } = require('http-status-codes');
const { BadRequest, CustomApiError } = require('../errors');

const handleIncomingMessage = async (req, res) => {
  const from = req.body.From;
  const body = req.body.Body;

  if (!from || !body) {
    throw new BadRequest('Missing required WhatsApp fields: From or Body');
  }

  const phone = from.split(':')[1]; // e.g. "whatsapp:+123456789" → "+123456789"
  if (!phone) {
    throw new BadRequest('Invalid sender phone format');
  }

  // Find user by phone
  const user = await User.findOne({ phone });

  const messages = user.messages;

  const airesponse = await generateReply(body, messages);
  if (!airesponse) {
    throw new CustomApiError(
      'Failed to generate AI response',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  if (user) {
    user.messages.push(body);
    await user.save();
  }

  const response = await twilioClient.messages.create({
    from: env.TWILIO_WHATSAPP_NUMBER,
    to: from,
    body: airesponse,
  });

  if (!response || !response.sid) {
    throw new CustomApiError(
      'Failed to send WhatsApp message',
      StatusCodes.BAD_GATEWAY
    );
  }

  res.status(StatusCodes.OK).json({ success: true, response });
};

// Generate QR code for joining WhatsApp sandbox
const sendQRCode = async (req, res) => {
  const twilioNumber = env.TWILIO_WHATSAPP_NUMBER?.replace('whatsapp:', '');
  const joinCode = `join ${env.TWILIO_JOIN_CODE}`;
  const encodedMessage = encodeURIComponent(joinCode);
  const waLink = `https://wa.me/${twilioNumber}?text=${encodedMessage}`;

  if (!twilioNumber || !env.TWILIO_JOIN_CODE) {
    throw new BadRequest('Missing Twilio number or join code');
  }

  const qrDataUrl = await QRCode.toDataURL(waLink);
  if (!qrDataUrl) {
    throw new CustomApiError(
      'Failed to generate QR code',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  const img = Buffer.from(qrDataUrl.split(',')[1], 'base64');

  res.writeHead(StatusCodes.OK, {
    'Content-Type': 'image/png',
    'Content-Length': img.length,
  });
  res.end(img);
};

module.exports = {
  handleIncomingMessage,
  sendQRCode,
};
