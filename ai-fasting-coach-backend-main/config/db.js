const mongoose = require('mongoose');
const { env } = require('./env');

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error);
    process.exit(1);
  }
};

module.exports = { connectDb };
