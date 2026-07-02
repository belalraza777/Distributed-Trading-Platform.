import { subscribeToQueue } from '../config/rabbit';
import { applyOrderToPortfolio, updateCurrentPrice } from '../services/portfolio.service';

// starts listening on startup — processes every executed order from order-service
export async function startConsumer() {

  //Queue name: order.executed [this queue is published to by order-service when an order executes]
  await subscribeToQueue('order.executed', async (msg: any) => {
    await applyOrderToPortfolio(msg.userId, msg.symbol, msg.type, msg.quantity, msg.price);
  });

  //Queue name: order.price.updated [this queue is published to by order-service when an order price is updated]
  await subscribeToQueue('order.price.updated', async (msg: any) => {
    await updateCurrentPrice(msg.symbol, msg.price);
  });

  console.log('Listening on queue: order.executed');
}