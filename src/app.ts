import { load } from 'dotenv-extended';
import express, { Request, Response } from 'express';
import session, { SessionOptions } from 'express-session';
import usersRoute from './api/users.js'
import postsRoute from './api/posts.js'
import { resolve } from 'path';
import { config } from 'dotenv';
config();

load();

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
    throw new Error('SESSION_SECRET is missing. Set it in your .env file.');
}

const app = express()

const oneDay = 1000 * 60 * 60;
const expSession: SessionOptions = {
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: oneDay
  }
}

app.use(express.static('public'))
app.use(session(expSession))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        database: req.app.locals.databaseStatus || 'unknown',
    });
})

app.get('/', (req: Request, res: Response) => {
    res.sendFile(resolve('public', 'index.html'));
})

app.use('/post', postsRoute)
app.use('/user', usersRoute)

export default app;
