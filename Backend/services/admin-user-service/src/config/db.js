const dns = require('dns');
const mongoose = require('mongoose');
global.mongoose = mongoose;

// Configure reliable public DNS servers for Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (_) {}

let isConnecting = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1 || isConnecting) {
    return mongoose.connection;
  }

  try {
    isConnecting = true;
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.warn('[Admin User Service] Warning: MONGO_URI not defined, running without DB connection.');
      return;
    }

    const conn = await mongoose.connect(mongoURI);
    console.log(`[Admin User Service] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Admin User Service] Database connection error: ${error.message}`);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[Admin Service] MongoDB disconnected. Reconnecting in 3s...');
  setTimeout(connectDB, 3000);
});

module.exports = connectDB;
