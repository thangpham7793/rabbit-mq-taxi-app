import amqp from "amqplib"
import { Buffer } from "buffer"
import { v4 as uuidv4 } from "uuid"

export type OrderTaxiProp = {
  channel: amqp.Channel
  queue: amqp.Replies.AssertQueue
  exchange: amqp.Replies.AssertExchange
}

class OrderTaxiMessage {
  private messageId: string

  constructor(public message: string) {
    this.message = message
    this.messageId = uuidv4()
  }

  toString() {
    return JSON.stringify({
      messageId: this.messageId,
      message: this.message,
    })
  }
}

export async function orderTaxi({ channel, queue, exchange }: OrderTaxiProp) {
  setInterval(
    () =>
      channel.publish(
        exchange.exchange,
        queue.queue,
        Buffer.from(
          new OrderTaxiMessage(`Sending to taxi ${queue.queue}`).toString()
        )
      ),
    5000
  )
}
