import amqp from "amqplib"
import { Buffer } from "buffer"
import { v4 as uuidv4 } from "uuid"
import { declareQueue } from "./declareQueue"

export type OrderTaxiDirectProp = {
  channel: amqp.Channel
  queue: amqp.Replies.AssertQueue
  exchange: amqp.Replies.AssertExchange
}

export type OrderTaxiByTopicProp = {
  channel: amqp.Channel
  exchange: amqp.Replies.AssertExchange
  key: string
  queue: amqp.Replies.AssertQueue
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

export async function orderTaxiDirect({
  channel,
  queue,
  exchange,
}: OrderTaxiDirectProp) {
  // re-declare to make sure queue exists (idempotent action)
  const taxiQueue = (await declareQueue({ channel, taxiName: queue.queue }))
    .queue

  setInterval(
    () =>
      // server-push to reduce load as opposed to front-end polling
      channel.publish(
        exchange.exchange,
        taxiQueue,
        Buffer.from(
          new OrderTaxiMessage(`Sending to taxi ${taxiQueue}`).toString()
        ),
        { messageId: uuidv4(), persistent: true }
      ),
    500
  )
}

export async function orderTaxiByTopic({
  channel,
  key,
  exchange,
}: OrderTaxiByTopicProp) {
  setInterval(
    () =>
      // server-push to reduce load as opposed to front-end polling
      channel.publish(
        exchange.exchange,
        key,
        Buffer.from(new OrderTaxiMessage(`Sending to taxi ${key}`).toString()),
        { messageId: uuidv4(), persistent: true }
      ),
    500
  )
}
