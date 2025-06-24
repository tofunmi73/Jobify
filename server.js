import 'express-async-errors';
import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import morgan from 'morgan';
const app = express();
import jobRouter from './routes/jobRouter.js';
import mongoose from 'mongoose';
import errorHandlerMiddleware from './middleware/errorHandlerMiddleware.js';
import authRouter from './routes/authRouter.js';
import { authenticateUser } from './middleware/authMiddleware.js';
import cookieParser from 'cookie-parser';
import userRouter from './routes/userRouter.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import cloudinary from 'cloudinary';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const __dirname = dirname(fileURLToPath(import.meta.url));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.static(path.resolve(__dirname, './client/dist')));
app.use(cookieParser());
// this converts our responses to json
app.use(express.json());

app.get('/api/v1/test', (req, res) => {
  res.json({ msg: 'test route' });
});


// Routes
app.use('/api/v1/users', authenticateUser, userRouter);
app.use('/api/v1/jobs', authenticateUser, jobRouter);
app.use('/api/v1/auth', authRouter);
app.use(helmet());
app.use(mongoSanitize());

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './client/dist', 'index.html'));
});

// Error middleware for pages/resources that do not exist
app.use('*', (req, res) => {
  res.status(404).json({ msg: 'not found' });
});

// Error middleware for any uncaught error
app.use(errorHandlerMiddleware);

// Server connects to db and launch
const port = process.env.PORT || 5100;
try {
  await mongoose.connect(process.env.MONGO_URL);
  app.listen(port, () => {
    console.log(`server running on PORT ${port}....`);
  });
} catch (error) {
  console.log(error);
  process.exit(1);
}