import { ConsumeMessage } from "amqplib"
import { OrderTaxiDirectProp, SubscribeByTopicProps } from "./types.dt"

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
