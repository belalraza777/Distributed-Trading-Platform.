import prisma from '../config/db';
import { lockFunds, releaseFunds, creditFunds } from './wallet.client';
import { getHolding } from './portfolio.client';
import { getLatestMarketPrice } from './market.client';
import { publishOrderExecuted } from '../messaging/publisher';

//Helper function to handle BUY orders and SELL orders

async function handleBuy(userId: number, total: number) {
  // deduct funds from wallet before executing
  await lockFunds(userId, total);
}

async function handleSell(userId: number, symbol: string, quantity: number, marketPrice: number) {
  // verify user holds enough quantity
  const holding = await getHolding(userId, symbol);
  if (!holding) throw new Error(`You don't hold any ${symbol}`);
  if (Number(holding.quantity) < quantity) throw new Error(`Insufficient ${symbol} holdings`);
  // credit wallet with sale proceeds using the fetched market price
  const saleTotal = quantity * marketPrice;
  await creditFunds(userId, saleTotal);
}

//Place a new order for a user
export async function placeOrder(
  userId: number,
  symbol: string,
  type: 'BUY' | 'SELL',
  quantity: number
) {
  if (quantity <= 0) throw new Error('Quantity must be greater than 0');

  const marketPrice = await getLatestMarketPrice(symbol);
  if (marketPrice <= 0) throw new Error('Price must be greater than 0');
  const total = quantity * marketPrice;

  // save as PENDING before any checks
  const order = await prisma.order.create({
    data: { user_id: userId, symbol, type, quantity, price: marketPrice, total, status: 'PENDING' },
  });

  try {
    if (type === 'BUY') await handleBuy(userId, total);
    if (type === 'SELL') await handleSell(userId, symbol, quantity, marketPrice);

    const executed = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'EXECUTED' },
    });

    // notify portfolio-service to update holdings
    publishOrderExecuted({ userId, symbol, type, quantity, price: marketPrice });

    return executed;
  } catch (err) {
    // mark failed so order isn't stuck in PENDING
    await prisma.order.update({ where: { id: order.id }, data: { status: 'FAILED' } });
    throw err;
  }
}

//Cancel an order if it is still pending
export async function cancelOrder(userId: number, orderId: number) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order || order.user_id !== userId) throw new Error('Order not found');
  if (order.status !== 'PENDING') throw new Error('Only pending orders can be cancelled');

  // only BUY orders had funds locked
  if (order.type === 'BUY') await releaseFunds(userId, Number(order.total));

  return prisma.order.update({ where: { id: orderId }, data: { status: 'CANCELLED' } });
}

//Get a specific order for a user
export async function getOrder(userId: number, orderId: number) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.user_id !== userId) throw new Error('Order not found');
  return order;
}

//Get all orders for a user with pagination
export async function getOrders(userId: number, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where: { user_id: userId } }),
  ]);

  return { orders, total, page, limit };
}