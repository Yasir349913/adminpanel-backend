const app = require('./app.js');
const { connectDb, env } = require('./config');

const startServer = async () => {
  try {
    await connectDb();
    app.listen(env.PORT, () => {
      console.log(`🚀 Server running at http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
