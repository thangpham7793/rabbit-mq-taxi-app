import { TaxiQueueAndExchange } from "./types.dt"
import { ExchangeTypes } from "./ExchangeTypes"
import amqp from "amqplib"
import { declareQueue } from "./declareQueue"

export async function getChannel(rabbitmqURI: string) {
  const conn = await amqp.connect(rabbitmqURI)
  return await conn.createChannel()
}

export async function initTopicExchange({
  channel,
  taxiName,
  exchangeName,
}: TaxiQueueAndExchange) {
  const queue = await declareQueue({ channel, taxiName })
  const exchange = await channel.assertExchange(
    exchangeName,
    ExchangeTypes.TOPIC,
    {
      durable: true,
      autoDelete: true,
    }
  )

  return {
    queue,
    exchange,
  }
}
