import { Buffer } from "buffer"
import { v4 as uuidv4 } from "uuid"
import { declareQueue } from "./declareQueue"
import { OrderTaxiByTopicProp, OrderTaxiDirectProp } from "./types.dt"
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
  const taxiQueue = (await declareQueue({ channel, queueName: queue.queue }))
    .queue

  // server-push to reduce load as opposed to front-end polling
  const isPublished = channel.publish(
    exchange.exchange,
    taxiQueue,
    Buffer.from(
      new OrderTaxiMessage(
        `Sending to taxi ${taxiQueue} from exchange ${exchange.exchange}`
      ).toString()
    ),
    { messageId: uuidv4(), persistent: true }
  )
  isPublished
    ? console.log(`Successfully published new direct order`)
    : console.error(`Failed to to publish new direct order`)
}

export function orderTaxiByTopic({
  channel,
  key,
  exchange,
}: OrderTaxiByTopicProp) {
  // server-push to reduce load as opposed to front-end polling
  const isPublished = channel.publish(
    exchange.exchange,
    key,
    Buffer.from(
      new OrderTaxiMessage(
        `Sending to queues binded to topic ${key}`
      ).toString()
    ),
    { messageId: uuidv4(), persistent: true }
  )

  isPublished
    ? console.log(`Successfully published new topic order`)
    : console.error(`Failed to to publish new topic order`)
}
