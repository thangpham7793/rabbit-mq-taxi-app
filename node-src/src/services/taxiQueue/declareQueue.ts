import amqp from "amqplib"

type DeclareQueueProps = {
  channel: amqp.Channel
  taxiName: string
}

export async function declareQueue({
  channel,
  taxiName,
}: DeclareQueueProps): Promise<amqp.Replies.AssertQueue> {
  return await channel.assertQueue(taxiName, {
    durable: true,
    autoDelete: false,
  })
}
