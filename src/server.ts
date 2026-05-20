import app from './app.js';
import connectDB from './config/database.js';

const port = process.env.PORT || 5000;
const isDevServer = process.env.npm_lifecycle_event === 'server';

const startServer = () => {
    app.listen(port, () => console.log(`Server running on port ${port}`));
};

try {
    await connectDB();
    app.locals.databaseStatus = 'connected';
    startServer();
} catch (error) {
    app.locals.databaseStatus = 'disconnected';

    if (isDevServer) {
        console.error('MongoDB connection failed. Starting dev server without database access.');
        console.error(error instanceof Error ? error.message : error);
        startServer();
    } else {
        console.error(error instanceof Error ? error.message : error);
        process.exit(1);
    }
}
