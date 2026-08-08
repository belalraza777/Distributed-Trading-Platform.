import express from 'express';
import dotenv from 'dotenv';
import { errorHandler, notFound } from './middleware/error.middleware';
import gatewayRoutes from './routes/gateway.routes';
import { checkBannedUser } from './middleware/banned.middleware';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';


dotenv.config();
const app = express();
app.use(helmet()); // Set security-related HTTP headers
app.use(cors(
  {
    origin: process.env.CLIENT_URL || 'http://localhost:8000',
    credentials: true
  }
)); // Enable Cross-Origin Resource Sharing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined')); // Log HTTP requests to the console


// Define routes 
app.get('/', (req, res) => res.send('api-gateway running'));
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', checkBannedUser, gatewayRoutes);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`api-gateway listening on ${port}`));
