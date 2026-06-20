import app from './app.js';
import connectDB from './config/database.js';
import { env } from './config/env.js';

const startServer = () => {
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT} (${env.NODE_ENV})`);
  });
};

const bootstrap = async () => {
  try {
    await connectDB();
    app.locals.databaseStatus = 'connected';
    startServer();
  } catch (error) {
    app.locals.databaseStatus = 'disconnected';

    if (env.NODE_ENV === 'development') {
      console.error('MongoDB connection failed. Starting dev server without database access.');
      console.error(error instanceof Error ? error.message : error);
      startServer();
      return;
    }

    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

bootstrap();
