import amqp from "amqplib"
/* eslint-disable no-undef */
import {
  taxiSubscribeByTopic,
  taxiSubscribeDirect,
  taxiSubscribeFanout,
} from "./consumer"
import { getChannel } from "./getChannel"
import { orderTaxiByTopic, orderTaxiDirect } from "./publisher"
import { appConfig } from "../../config"
import { getExchange } from "./getExchange"
import { ExchangeTypes } from "./types.dt"

async function main() {
  const channel = await getChannel(appConfig.rabbitmqURI)
  channel.on("error", (err) => console.error(err))
  const fanoutExchange = await getExchange({
    channel,
    name: "general_anouncement",
    type: ExchangeTypes.FANOUT,
  })
  const DLQ = "taxi-dlq"
  const DLX = "taxi-dlx"
  const policy = { messageTtl: 604800000, deadLetterExchange: DLX }

  const taxis = ["taxi.1"]
  taxis.forEach((queueName) =>
    channel
      .assertQueue(queueName, {
        durable: true,
        autoDelete: false,
        ...policy,
      })
      .then((queue: amqp.Replies.AssertQueue) => {
        console.log(`Created queue ${queue.queue}`)
        taxiSubscribeFanout({
          channel,
          exchange: fanoutExchange,
          queue,
        }).then(() => {
          channel.publish(
            fanoutExchange.exchange,
            "",
            Buffer.from("Hello from CC Headquarter!")
          )
        })
      })
  )

  const directExchange = await getExchange({
    channel,
    name: "taxi",
    type: ExchangeTypes.DIRECT,
  })

  const directQueues = await Promise.all(
    taxis.map((queueName) =>
      channel.assertQueue(queueName, {
        durable: true,
        autoDelete: false,
        ...policy,
      })
    )
  )

  await Promise.all(
    directQueues.map((queue) =>
      taxiSubscribeDirect({
        channel,
        exchange: directExchange,
        queue,
      })
    )
  )

  await Promise.all(
    directQueues.map((queue) =>
      orderTaxiDirect({
        channel,
        exchange: directExchange,
        queue,
      })
    )
  )

  const ecoExchange = await getExchange({
    channel,
    name: "taxi-topic",
    type: ExchangeTypes.TOPIC,
  })

  const ecoTopicQueues = await Promise.all(
    taxis.map((queueName) =>
      channel.assertQueue(queueName, {
        durable: true,
        autoDelete: false,
        ...policy,
      })
    )
  )

  await Promise.all(
    ecoTopicQueues.map((queue) =>
      taxiSubscribeByTopic({
        channel,
        queue,
        exchange: ecoExchange,
        key: "taxi.#.eco.#", // receive "taxi" and "taxi.eco"
      })
    )
  )

  const keys = ["taxi", "taxi.eco", "taxi.luxury", "taxi.luxury.eco"]
  keys.forEach((key) =>
    orderTaxiByTopic({
      channel,
      exchange: ecoExchange,
      key,
    })
  )

  // dead-letter-exchange and queue for expired messages
  const deadLetterExchange = await getExchange({
    channel,
    name: DLX,
    type: ExchangeTypes.FANOUT,
  })

  channel
    .assertQueue(DLQ, {
      durable: true,
      autoDelete: false,
    })
    .then((queue: amqp.Replies.AssertQueue) =>
      taxiSubscribeFanout({
        channel,
        queue,
        exchange: deadLetterExchange,
      })
    )

  // delayed queue (such as for a survey at the end of a trip)
  const DELAYED_QUEUE = "work.later"
  const DESTINATION_QUEUE = "work.now"
  const delayPolicy = {
    messageTtl: 30000,
    deadLetterExchange: "",
    deadLetterRoutingKey: DESTINATION_QUEUE,
  }
  const delayedQueue = await channel.assertQueue(DELAYED_QUEUE, {
    ...delayPolicy,
  })
  const destinationQueue = await channel.assertQueue(DESTINATION_QUEUE, {
    durable: true,
  })
  await channel.consume(
    destinationQueue.queue,
    (msg: amqp.ConsumeMessage | null) => {
      if (!msg) return
      try {
        console.log(
          `Received delayed message: ${msg?.content} at ${Date.now()}`
        )
        channel.ack(msg)
      } catch (error) {
        console.error(error)
        channel.nack(msg)
      }
    }
  )
  channel.sendToQueue(
    delayedQueue.queue,
    Buffer.from(`Delayed message sent at ${Date.now()}`)
  )
}

main().catch((error: NodeJS.ErrnoException) => console.error(error.message))
