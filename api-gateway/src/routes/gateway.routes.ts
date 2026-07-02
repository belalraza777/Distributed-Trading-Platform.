import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { services } from '../config/services';

const router = Router();

const createProxy = (target: string, pathRewrite?: (path: string) => string) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
  });

//simple Explain :- this fn takes a path and an array of prefixes. It checks if the path starts with any of the prefixes. If it does, it removes that prefix from the path and returns the modified path. If the path is exactly equal to a prefix, it returns '/'. If none of the prefixes match, it returns the original path unchanged. This is useful for routing requests to different services while maintaining clean URLs.
const stripPrefix = (path: string, prefixes: string[]) => {
  for (const prefix of prefixes) {
    if (path === prefix) {
      return '/';
    }

    if (path.startsWith(`${prefix}/`)) {
      return path.slice(prefix.length);
    }
  }

  return path;
};

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/auth', createProxy(services.auth, (path) => stripPrefix(path, ['/api/auth', '/auth'])));
router.use('/market-data', createProxy(services.marketData, (path) => stripPrefix(path, ['/api/market-data', '/market-data'])));
router.use('/notifications', createProxy(services.notification, (path) => stripPrefix(path, ['/api/notifications', '/notifications'])));
router.use('/orders', createProxy(services.order, (path) => stripPrefix(path, ['/api/orders', '/orders'])));
router.use('/portfolio', createProxy(services.portfolio, (path) => stripPrefix(path, ['/api/portfolio', '/portfolio'])));
router.use('/wallet', createProxy(services.wallet, (path) => stripPrefix(path, ['/api/wallet', '/wallet'])));

export default router;
