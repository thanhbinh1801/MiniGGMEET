import express from 'express';
import dotenv from 'dotenv';
import indexRouter from './routes/index.route.js';
import instanceDatabase from './config/singleton_pattern.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { errorHandler } from './handler/error-handler.js';

dotenv.config();

instanceDatabase;
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

indexRouter(app);

app.use(errorHandler);

app.use('*', (req, res) =>{
  res.status(404).json({error: "Resource not found"});
});

export default app;