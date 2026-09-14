import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jodhpur_voyage';
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 15000, // 15 seconds timeout
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} [Database: ${conn.connection.name}]`);

    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting reconnection...');
    });
    
    return conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
