import { Router } from 'express';
const expressProxy = require('express-http-proxy');
import { services } from '../config/services';

const router = Router();

//Later we KONG Gateway
const createProxy = (target: string) => expressProxy(target);

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/auth', createProxy(services.auth));
router.use('/market-data', createProxy(services.marketData));
router.use('/notifications', createProxy(services.notification));
router.use('/orders', createProxy(services.order));
router.use('/portfolio', createProxy(services.portfolio));
router.use('/wallet', createProxy(services.wallet));

export default router;
