import { ConsumeMessage } from "amqplib"
import { OrderTaxiProp } from "./publisher"

export async function taxiSubscribe({ channel, queue }: OrderTaxiProp) {
  function processOrder(message: ConsumeMessage | null) {
    if (!message) return
    try {
      console.log(`Processing order ${message.content}, which can fail!`)
      channel.ack(message)
    } catch (error) {
      console.error(error.message)
      channel.nack(message)
    }
  }
  await channel.consume(queue.queue, processOrder, {
    noAck: false,
  })
}
