import amqp from "amqplib"
import { declareQueue } from "./declareQueue"
import { TaxiQueueAndExchange } from "./types.dt"

export async function getChannel(rabbitmqURI: string) {
  const conn = await amqp.connect(rabbitmqURI)
  return await conn.createChannel()
}

export async function initDirectQueue({
  channel,
  taxiName,
  exchange,
}: TaxiQueueAndExchange) {
  const queue = await declareQueue({ channel, taxiName })
  await channel.bindQueue(queue.queue, exchange.exchange, taxiName)
  return queue
}
