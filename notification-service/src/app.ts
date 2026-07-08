import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import prisma from './config/db';
import { asyncHandler } from './middleware/async.middleware';
import { errorHandler, notFound } from './middleware/error.middleware';
import { initMessaging } from './messaging/init';
import notificationRoutes from './routes/notification.route';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.get('/health', asyncHandler(async (req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: 'ok' });
}));

//routes
app.use('/', notificationRoutes);

app.use(notFound);
app.use(errorHandler);

// Initialize messaging (e.g., RabbitMQ, Kafka, etc.)
initMessaging().then(() => {
  console.log("Messaging initialized");
}).catch((err) => {
  console.error("Messaging initialization failed", err);
  process.exit(1);
})

const port = process.env.PORT || 3003;
app.listen(port, () => console.log(`notification-service listening on ${port}`));
