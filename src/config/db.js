import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState >= 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jodhpur_voyage';
    
    cached.promise = mongoose
      .connect(mongoUri, {
        autoIndex: true,
        serverSelectionTimeoutMS: 10000
      })
      .then((mongooseInstance) => {
        console.log(`✅ MongoDB Connected: ${mongooseInstance.connection.host} [Database: ${mongooseInstance.connection.name}]`);
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        console.error(`❌ MongoDB connection error: ${err.message}`);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    throw error;
  }
};

export default connectDB;
