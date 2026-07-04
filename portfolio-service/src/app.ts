import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import prisma from './config/db';
import { asyncHandler } from './middleware/async.middleware';
import { errorHandler, notFound } from './middleware/error.middleware';
import portfolioRoutes from './routes/portfolio.routes';
import { initMessaging } from './messaging/init';

// Load environment variables from .env file
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// routes
// app.get('/', (req, res) => res.send('portfolio-service running'));
app.use('/', portfolioRoutes);

app.get('/health', asyncHandler(async (req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: 'ok' });
}));

// error handling
app.use(notFound);
app.use(errorHandler);

// Initialize messaging
initMessaging().catch((error) => {
  console.error("Failed to initialize messaging", error);
  process.exit(1);
});

const port = process.env.PORT || 3005;

app.listen(port, () => console.log(`portfolio-service listening on ${port}`));
