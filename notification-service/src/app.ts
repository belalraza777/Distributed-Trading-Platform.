import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import prisma from './config/db';
import { asyncHandler } from './middleware/async.middleware';
import { errorHandler, notFound } from './middleware/error.middleware';
import { connectRabbit } from './config/rabbit';
import { requireAuth } from './middleware/auth.middleware';
import { startConsumers } from './messaging/consumer';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.get('/health', asyncHandler(async (req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: 'ok' });
}));

// //Get Notification for a logged in user
// app.get('/', requireAuth, asyncHandler(async (req, res) => {
//   const userId = (req as any).user.id;
//   const notifications = await prisma.notification.findMany({
//     where: {user_id: userId},
//     orderBy: { createdAt: 'desc' },
//   });
//   res.status(200).json(notifications);
// }));

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3003;
connectRabbit().catch(err => console.error('RabbitMQ connection error', err));
startConsumers().catch(err => console.error('Error starting consumers', err));
app.listen(port, () => console.log(`notification-service listening on ${port}`));
