import amqp from "amqplib"
import { Buffer } from "buffer"
import { v4 as uuidv4 } from "uuid"
import { declareQueue } from "./declareQueue"

export type OrderTaxiProp = {
  channel: amqp.Channel
  queue: amqp.Replies.AssertQueue
  exchange: amqp.Replies.AssertExchange
}

class OrderTaxiMessage {
  constructor(public message: string) {
    this.message = message
  }

  toString() {
    return JSON.stringify({
      message: this.message,
    })
  }
}

export async function orderTaxi({ channel, queue, exchange }: OrderTaxiProp) {
  // re-declare to make sure queue exists (idempotent action)
  const taxiQueue = await declareQueue({ channel, taxiName: queue.queue })
  setInterval(
    () =>
      // server-push to reduce load as opposed to front-end polling
      channel.publish(
        exchange.exchange,
        taxiQueue.queue,
        Buffer.from(
          new OrderTaxiMessage(`Sending to taxi ${queue.queue}`).toString()
        ),
        { messageId: uuidv4(), persistent: true }
      ),
    2000
  )
}
