import amqp from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let connection: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let channel: any = null;

export async function getChannel(): Promise<amqp.Channel> {
  if (!channel) {
    const conn = await amqp.connect(RABBITMQ_URL);
    connection = conn;
    channel = await conn.createChannel();
    await channel.assertExchange("smartndc", "topic", { durable: true });
  }
  return channel;
}

export type EventMessage = {
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
};

export async function publishEvent(routingKey: string, message: EventMessage): Promise<void> {
  const ch = await getChannel();
  ch.publish("smartndc", routingKey, Buffer.from(JSON.stringify(message)), {
    persistent: true,
    contentType: "application/json",
  });
}

export async function consumeEvents(
  queueName: string,
  routingKey: string,
  handler: (msg: EventMessage) => Promise<void>
): Promise<void> {
  const ch = await getChannel();
  await ch.assertQueue(queueName, { durable: true });
  await ch.bindQueue(queueName, "smartndc", routingKey);
  await ch.consume(queueName, async (msg) => {
    if (msg) {
      try {
        const event: EventMessage = JSON.parse(msg.content.toString());
        await handler(event);
        ch.ack(msg);
      } catch (err) {
        console.error("RabbitMQ handler error:", err);
        ch.nack(msg, false, true);
      }
    }
  });
}

export async function closeRabbitMQ(): Promise<void> {
  try { await channel?.close(); } catch {}
  try { await connection?.close(); } catch {}
}
