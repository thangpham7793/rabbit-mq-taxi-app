/* eslint-disable no-undef */
import amqp from "amqplib"
import { appConfig } from "./config"
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
  const conn = await amqp.connect(appConfig.rabbitmqURI as string)
  const channel = await conn.createChannel()
  const queue = await declareQueue({ channel, taxiName })
  const exchange = await channel.assertExchange(taxiExchange, "direct", {
    durable: true,
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
