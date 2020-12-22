/* eslint-disable no-undef */
import { appConfig } from "./config"
import amqp from "amqplib"
import { declareQueue } from "./declareQueue"

type TaxiQueueAndExchange = {
  taxiName: string
  taxiExchange: string
}

function gracefulShutdown(conn: amqp.Connection) {
  process.on("SIGTERM", async () => {
    await conn.close()
    console.log(`Exit gracefully`)
    process.exit(0)
  })

  process.on("SIGINT", async () => {
    await conn.close()
    console.log(`Exit gracefully`)
    process.exit(0)
  })
}

export async function init({ taxiName, taxiExchange }: TaxiQueueAndExchange) {
  const conn = await amqp.connect(appConfig.rabbitmqURI)
  const channel = await conn.createChannel()
  const queue = await declareQueue({ channel, taxiName })
  const exchange = await channel.assertExchange(taxiExchange, "direct", {
    durable: false,
    autoDelete: true,
  })
  await channel.bindQueue(queue.queue, exchange.exchange, taxiName)

  gracefulShutdown(conn)

  return {
    channel,
    queue,
    exchange,
  }
}
