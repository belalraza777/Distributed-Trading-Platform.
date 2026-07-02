import { publishToQueue } from '../config/rabbit';

// fires after order price is updated — portfolio-service listens on this queue
export async function publishOrderPriceUpdated(data: {
    symbol: string;
    price: number;
}) {
    await publishToQueue('order.price.updated', data);
}