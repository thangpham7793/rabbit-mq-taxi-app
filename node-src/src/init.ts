import { ExchangeTypes } from "./ExchangeTypes"
import amqp from "amqplib"
import { declareQueue } from "./declareQueue"

type TaxiQueueAndExchange = {
  channel: amqp.Channel
  taxiName: string
  exchangeName: string
  exchangeType: string
}

export async function getChannel(rabbitmqURI: string) {
  const conn = await amqp.connect(rabbitmqURI)
  return await conn.createChannel()
}

export async function init({
  channel,
  taxiName,
  exchangeName,
  exchangeType,
}: TaxiQueueAndExchange) {
  const queue = await declareQueue({ channel, taxiName })
  const exchange = await channel.assertExchange(exchangeName, exchangeType, {
    durable: true,
    autoDelete: true,
  })

  if (exchangeType === ExchangeTypes.DIRECT) {
    await channel.bindQueue(queue.queue, exchange.exchange, taxiName)
  }

  return {
    channel,
    queue,
    exchange,
  }
}
