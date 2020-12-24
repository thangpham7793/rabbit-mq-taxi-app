import { ConsumeMessage } from "amqplib"
import { OrderTaxiDirectProp, SubscribeByTopicProps } from "./types.dt"

export async function taxiSubscribeFanout({
  channel,
  queue,
  exchange,
}: OrderTaxiDirectProp) {
  function generalAnouncementHandler(message: ConsumeMessage | null) {
    if (!message) return
    try {
      console.log(`Received ${message.content}`)
      channel.ack(message)
    } catch (error) {
      console.error(error.message)
      channel.nack(message)
    }
  }
  await channel
    .bindQueue(queue.queue, exchange.exchange, "")
    .then(() => {
      console.log(`Subscribed to queue ${queue.queue}`)
      channel.consume(queue.queue, generalAnouncementHandler, {
        noAck: false,
      })
    })
    .then(() => console.log(`Start consuming from ${queue.queue}`))
}

export async function taxiSubscribeDirect({
  channel,
  queue,
  exchange,
}: OrderTaxiDirectProp) {
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

  await channel.bindQueue(queue.queue, exchange.exchange, queue.queue)
  await channel.consume(queue.queue, processOrder, {
    noAck: false,
  })
}

export async function taxiSubscribeByTopic({
  channel,
  key,
  exchange,
  queue,
}: SubscribeByTopicProps) {
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
  await channel.bindQueue(queue.queue, exchange.exchange, key)
  await channel.consume(queue.queue, processOrder, {
    noAck: false,
  })
}
