import cors from 'cors';
import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import session, { SessionOptions } from 'express-session';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import apiRouter from './routes/index.js';
import { openApiSpec } from './docs/openapi.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const publicDir = resolve(__dirname, '../public');

const oneDay = 1000 * 60 * 60 * 24;

const sessionConfig: SessionOptions = {
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'blog.sid',
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: oneDay,
  },
};

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: env.CORS_ORIGIN ?? true,
  credentials: true,
}));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
}));

app.use(express.static(publicDir));
app.use(session(sessionConfig));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      environment: env.NODE_ENV,
      database: app.locals.databaseStatus ?? 'unknown',
      timestamp: new Date().toISOString(),
    },
  });
});

app.get('/api/docs', (_req: Request, res: Response) => {
  res.status(200).json(openApiSpec);
});

app.get('/', (_req: Request, res: Response) => {
  res.sendFile(resolve(publicDir, 'index.html'));
});

app.use('/api/v1', apiRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
