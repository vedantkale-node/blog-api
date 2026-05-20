import { connect } from 'mongoose';

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI || process.env.MONGOURI;

    if (!mongoUri) {
        throw new Error('MongoDB connection string is missing. Set MONGO_URI in your .env file.');
    }

    await connect(mongoUri);
    console.log('mongoose connected!')
}

export default connectDB;
