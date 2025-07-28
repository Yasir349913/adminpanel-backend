const twilio = require('twilio');
const { env } = require('./env');

const twilioClient = twilio(env.TWILIO_SID, env.TWILIO_AUTH_TOKEN);

module.exports = { twilioClient };
