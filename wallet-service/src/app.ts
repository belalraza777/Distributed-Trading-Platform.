import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import prisma from './config/db';
import walletRoutes from './routes/wallet.route';
import { asyncHandler } from './middleware/async.middleware';
import { errorHandler, notFound } from './middleware/error.middleware';
import { connectRabbit } from './config/rabbit';

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => res.send('wallet-service running'));

app.get('/health', asyncHandler(async (req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: 'ok' });
}));
app.use('/', walletRoutes); // Mount wallet routes at root path
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3006;
connectRabbit().catch(err => console.error('RabbitMQ connection error', err));
app.listen(port, () => console.log(`wallet-service listening on ${port}`));
