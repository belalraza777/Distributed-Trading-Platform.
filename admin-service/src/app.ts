import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import prisma from './config/db';
import { asyncHandler } from './middleware/async.middleware';
import { errorHandler, notFound } from './middleware/error.middleware';
import { connectRabbit } from './config/rabbit';

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// app.get('/', (req, res) => res.send('admin-service running'));

// app.use('/', orderRoutes);

app.get('/health', asyncHandler(async (req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: 'ok' });
}));

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3007;
connectRabbit().catch(err => console.error('RabbitMQ connection error', err));
app.listen(port, () => console.log(`admin-service listening on ${port}`));
