import express from 'express';
import dotenv from 'dotenv';
import { errorHandler, notFound } from './middleware/error.middleware';
import gatewayRoutes from './routes/gateway.routes';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import {rateLimit} from 'express-rate-limit';


dotenv.config();
const app = express();
app.use(helmet()); // Set security-related HTTP headers
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Log HTTP requests to the console
// const limiter = rateLimit({ // Rate limiting middleware
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 1000, // Limit each IP to 1000 requests per windowMs
// });
// app.use(limiter); // Apply rate limiting to all requests

app.get('/', (req, res) => res.send('api-gateway running'));
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', gatewayRoutes);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`api-gateway listening on ${port}`));
