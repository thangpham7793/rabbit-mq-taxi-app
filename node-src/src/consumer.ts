import { ConsumeMessage } from "amqplib"
import { OrderTaxiProp } from "./publisher"
function processOrder(payload: ConsumeMessage | null) {
  console.log(`Received order for ${payload?.content}`)
}

export async function taxiSubscribe({ channel, queue }: OrderTaxiProp) {
  await channel.consume(queue.queue, processOrder, {
    noAck: true,
  })
}
