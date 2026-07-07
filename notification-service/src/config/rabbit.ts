import * as amqp from 'amqplib';

// single channel shared across the service — call connectRabbit() once on startup
let channel: any = null;

export async function connectRabbit() {
  const conn = await amqp.connect(process.env.RABBIT_URL || 'amqp://localhost');
  channel = await conn.createChannel();
  console.log('RabbitMQ connected');
}

// serializes data to JSON and sends to queue
export async function publishToQueue(queue: string, data: object) {
  await channel.assertQueue(queue, { durable: true, retry: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
}

// deserializes message and passes to handler — acks after handler runs
export async function subscribeToQueue(queue: string, handler: (msg: object) => void) {
  await channel.assertQueue(queue, { durable: true, retry: true });
  channel.consume(queue, (msg: any) => {
    if (msg) {
      handler(JSON.parse(msg.content.toString()));
      channel.ack(msg);
    }
  });
}