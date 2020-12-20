/* eslint-disable no-undef */
import { appConfig } from "./config"
import amqp from "amqplib"

type TaxiQueueAndExchange = {
  taxiName: string
  taxiExchange: string
}

export async function init({ taxiName, taxiExchange }: TaxiQueueAndExchange) {
  const conn = await amqp.connect(appConfig.rabbitmqURI)
  const channel = await conn.createChannel()
  const queue = await channel.assertQueue(taxiName, { durable: false })
  const exchange = await channel.assertExchange(taxiExchange, "direct", {
    durable: false,
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
