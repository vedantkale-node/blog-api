import app from './app.js';
import connectDB from './config/database.js';

const port = process.env.PORT || 5000;

try {
    await connectDB();
    app.listen(port, () => console.log(`Server running on port ${port}`));
} catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
}
