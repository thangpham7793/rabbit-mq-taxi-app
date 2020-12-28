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
  const fanoutExchange = await getExchange({
    channel,
    name: "general_anouncement",
    type: ExchangeTypes.FANOUT,
  })
  const policy = { messageTtl: 604800000, deadLetterExchange: "taxi-dlx" }

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
  const DLQ = "taxi-dlq"
  const DLX = "taxi-dlx"
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
}

main().catch((error: NodeJS.ErrnoException) => console.error(error.message))
