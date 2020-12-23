import { ExchangeTypes, TaxiQueueAndExchange } from "./types.dt"
import amqp from "amqplib"
import { declareQueue } from "./declareQueue"

export async function getChannel(rabbitmqURI: string) {
  const conn = await amqp.connect(rabbitmqURI)
  return await conn.createChannel()
}

export async function initTopicQueue({
  channel,
  taxiName,
  exchange,
}: TaxiQueueAndExchange) {
  const queue = await declareQueue({ channel, taxiName })
  await channel.assertExchange(exchange.exchange, ExchangeTypes.TOPIC, {
    durable: true,
    autoDelete: true,
  })
  return queue
}
