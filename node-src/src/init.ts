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
  const directExchange = await channel.assertExchange(
    exchangeName,
    exchangeType,
    {
      durable: true,
      autoDelete: true,
    }
  )
  await channel.bindQueue(queue.queue, directExchange.exchange, taxiName)

  return {
    channel,
    queue,
    directExchange,
  }
}
