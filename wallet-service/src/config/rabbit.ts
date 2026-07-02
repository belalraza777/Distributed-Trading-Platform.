import * as amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBIT_URL || 'amqp://localhost';

let connection: any = null;
let channel: any = null;

export async function connectRabbit() {
  if (channel) return channel;
  connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();
  console.log('Connected to RabbitMQ');
  return channel;
}

export async function publishToQueue(queueName: string, data: any) {
  const ch = await connectRabbit();
  await ch.assertQueue(queueName, { durable: true });
  ch.sendToQueue(queueName, Buffer.from(typeof data === 'string' ? data : JSON.stringify(data)));
}

export async function subscribeToQueue(queueName: string, onMessage: (msg: string) => void) {
  const ch = await connectRabbit();
  await ch.assertQueue(queueName, { durable: true });
  await ch.consume(queueName, (msg: any) => {
    if (msg) {
      try {
        onMessage(msg.content.toString());
      } finally {
        ch.ack(msg);
      }
    }
  });
}
