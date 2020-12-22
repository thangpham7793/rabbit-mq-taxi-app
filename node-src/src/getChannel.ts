/* eslint-disable no-undef */
import amqp from "amqplib"

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

export async function getChannel(rabbitmqURI: string) {
  const conn = await amqp.connect(rabbitmqURI)

  gracefulShutdown(conn)
  return await conn.createChannel()
}
