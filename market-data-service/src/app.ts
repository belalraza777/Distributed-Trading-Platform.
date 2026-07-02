import express from 'express';
import dotenv from 'dotenv';
import prisma from './config/db';
import stockRoutes from './routes/stock.route';
import { asyncHandler } from './middleware/async.middleware';
import { errorHandler, notFound } from './middleware/error.middleware';
import { connectRabbit } from './config/rabbit';
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('market-data-service running'));

app.get('/health', asyncHandler(async (req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: 'ok' });
}));

// Routes
app.use('/', stockRoutes);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3002;
connectRabbit().catch(err => console.error('RabbitMQ connection error', err));
app.listen(port, () => console.log(`market-data-service listening on ${port}`));
