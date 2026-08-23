require('dotenv').config();

const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not configured. Set it in backend/.env');
  }

  mongoose.set('strictQuery', true);

  if (mongoose.connection.readyState === 1) return mongoose.connection;

  try {
    await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4
    });

    await mongoose.connection.asPromise();
    mongoose.set('bufferCommands', false);
  } catch (error) {
    if (error.message.includes('querySrv ECONNREFUSED') || error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      throw new Error(
        'MongoDB connection failed. Verify MONGODB_URI, DNS resolution, and Atlas network access (IP whitelist / firewall). ' +
        `Original error: ${error.message}`
      );
    }

    throw error;
  }

  return mongoose.connection;
};

module.exports = connectDB;

