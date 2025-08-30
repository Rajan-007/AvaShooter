import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async () => {
  try {
    console.log(`🔗 Connecting to MongoDB: ${env.mongoUri}`);
    await mongoose.connect(env.mongoUri);
    console.log('✅ MongoDB connected successfully');
    
    // Test the connection
    if (mongoose.connection.db) {
      const dbName = mongoose.connection.db.databaseName;
      console.log(`📊 Connected to database: ${dbName}`);
    }
    
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    console.log('💡 Make sure MongoDB is running and accessible');
    process.exit(1);
  }
};