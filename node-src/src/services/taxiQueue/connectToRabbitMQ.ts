import amqp from "amqplib"

export async function connect(rabbitmqURI: string): Promise<amqp.Connection> {
  return await amqp.connect(rabbitmqURI)
}
