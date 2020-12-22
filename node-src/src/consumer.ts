import { ConsumeMessage } from "amqplib"
import { OrderTaxiDirectProp, OrderTaxiByTopicProp } from "./publisher"

export async function taxiSubscribeDirect({
  channel,
  queue,
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
  await channel.consume(queue.queue, processOrder, {
    noAck: false,
  })
}

export async function taxiSubscribeByTopic({
  channel,
  key,
  exchange,
  queue,
}: OrderTaxiByTopicProp) {
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
