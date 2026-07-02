import express from 'express';
import dotenv from 'dotenv';
import { errorHandler, notFound } from './middleware/error.middleware';
import gatewayRoutes from './routes/gateway.routes';

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('api-gateway running'));

app.use('/api', gatewayRoutes);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`api-gateway listening on ${port}`));
