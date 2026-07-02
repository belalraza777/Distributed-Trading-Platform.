import prisma from '../config/db';

// P&L = (current_price - avg_buy_price) * quantity
function calcPnL(qty: number, avg: number, current: number) {
  const current_value = qty * current;
  const invested_value = qty * avg;
  const pnl = current_value - invested_value;
  const pnl_percent = invested_value > 0 ? (pnl / invested_value) * 100 : 0;

  return {
    current_value: +current_value.toFixed(2),
    invested_value: +invested_value.toFixed(2),
    pnl: +pnl.toFixed(2),
    pnl_percent: +pnl_percent.toFixed(2),
  };
}

// returns all holdings with P&L + overall summary
export async function getPortfolio(userId: number) {
  const holdings = await prisma.holding.findMany({
    where: { user_id: userId },
    orderBy: { symbol: 'asc' },
  });

  const enriched = holdings.map((h) =>
    ({ ...h, ...calcPnL(Number(h.quantity), Number(h.avg_buy_price), Number(h.current_price)) })
  );

  const total_invested = enriched.reduce((sum, h) => sum + h.invested_value, 0);
  const total_current = enriched.reduce((sum, h) => sum + h.current_value, 0);
  const total_pnl = +(total_current - total_invested).toFixed(2);
  const total_pnl_percent = total_invested > 0 ? +((total_pnl / total_invested) * 100).toFixed(2) : 0;

  return {
    holdings: enriched,
    summary: { total_invested, total_current_value: total_current, total_pnl, total_pnl_percent },
  };
}

// returns single holding with P&L
export async function getHolding(userId: number, symbol: string) {
  const h = await prisma.holding.findUnique({
    where: { user_id_symbol: { user_id: userId, symbol } },
  });
  if (!h) throw new Error('Holding not found');
  return { ...h, ...calcPnL(Number(h.quantity), Number(h.avg_buy_price), Number(h.current_price)) };
}

// triggered by RabbitMQ when an order executes — create/update/delete holding
export async function applyOrderToPortfolio(
  userId: number,
  symbol: string,
  type: 'BUY' | 'SELL',
  quantity: number,
  price: number
) {
  const existing = await prisma.holding.findUnique({
    where: { user_id_symbol: { user_id: userId, symbol } },
  });

  if (type === 'BUY') {
    if (!existing) {
      // first buy — create row
      await prisma.holding.create({
        data: { user_id: userId, symbol, quantity, avg_buy_price: price, current_price: price },
      });
    } else {
      // subsequent buy — weighted average: (old_qty * old_avg + new_qty * price) / total_qty
      const old_qty = Number(existing.quantity);
      const new_qty = old_qty + quantity;
      const new_avg = (old_qty * Number(existing.avg_buy_price) + quantity * price) / new_qty;

      await prisma.holding.update({
        where: { user_id_symbol: { user_id: userId, symbol } },
        data: { quantity: new_qty, avg_buy_price: +new_avg.toFixed(2), current_price: price },
      });
    }
  }

  if (type === 'SELL') {
    if (!existing) throw new Error(`No holding found for ${symbol}`);

    const new_qty = Number(existing.quantity) - quantity;
    if (new_qty < 0) throw new Error('Insufficient holdings to sell');

    if (new_qty === 0) {
      // fully sold — remove row
      await prisma.holding.delete({ where: { user_id_symbol: { user_id: userId, symbol } } });
    } else {
      // partial sell — avg_buy_price stays same, only qty + current_price update
      await prisma.holding.update({
        where: { user_id_symbol: { user_id: userId, symbol } },
        data: { quantity: new_qty, current_price: price },
      });
    }
  }
}

// called by market-data service to refresh price for all users holding a symbol
export async function updateCurrentPrice(symbol: string, price: number) {
  await prisma.holding.updateMany({ where: { symbol }, data: { current_price: price } });
}