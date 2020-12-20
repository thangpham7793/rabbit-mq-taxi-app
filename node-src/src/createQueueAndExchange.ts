/* eslint-disable no-undef */
import amqp from "amqplib"
import dotenv from "dotenv"
dotenv.config()

type TaxiQueueAndExchange = {
  taxiName: string
  taxiExchange: string
}

export async function init({ taxiName, taxiExchange }: TaxiQueueAndExchange) {
  const conn = await amqp.connect(process.env.RABBITMQ_URI as string)
  const channel = await conn.createChannel()
  const queue = await channel.assertQueue(taxiName, { durable: true })
  const exchange = await channel.assertExchange(taxiExchange, "direct", {
    durable: true,
    autoDelete: true,
  })
  await channel.bindQueue(queue.queue, exchange.exchange, taxiName)
  process.on("SIGTERM", async () => {
    await conn.close()
    console.log(`Exit gracefully`)
    process.exit(0)
  })
  return {
    channel,
    queue,
    exchange,
  }
}
