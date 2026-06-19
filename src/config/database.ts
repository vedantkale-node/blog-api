import { connect } from 'mongoose';
import { env } from './env.js';

const connectDB = async () => {
  await connect(env.MONGO_URI);
  console.log('MongoDB connected');
};

export default connectDB;
