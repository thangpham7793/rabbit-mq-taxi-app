import { ExchangeTypes } from "./ExchangeTypes"
import amqp from "amqplib"
import { declareQueue } from "./declareQueue"
import { TaxiQueueAndExchange } from "./types.dt"

export async function getChannel(rabbitmqURI: string) {
  const conn = await amqp.connect(rabbitmqURI)
  return await conn.createChannel()
}

export async function initDirectExchange({
  channel,
  taxiName,
  exchangeName,
}: TaxiQueueAndExchange) {
  const queue = await declareQueue({ channel, taxiName })
  const exchange = await channel.assertExchange(
    exchangeName,
    ExchangeTypes.DIRECT,
    {
      durable: true,
      autoDelete: true,
    }
  )
  await channel.bindQueue(queue.queue, exchange.exchange, taxiName)
  return {
    queue,
    exchange,
  }
}
