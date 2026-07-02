const getServiceUrl = (envName: string, fallbackPort: number) =>
  process.env[envName] || `http://localhost:${fallbackPort}`;

export const services = {
  auth: getServiceUrl('AUTH_SERVICE_URL', 3001),
  marketData: getServiceUrl('MARKET_DATA_SERVICE_URL', 3002),
  notification: getServiceUrl('NOTIFICATION_SERVICE_URL', 3003),
  order: getServiceUrl('ORDER_SERVICE_URL', 3004),
  portfolio: getServiceUrl('PORTFOLIO_SERVICE_URL', 3005),
  wallet: getServiceUrl('WALLET_SERVICE_URL', 3006),
};
