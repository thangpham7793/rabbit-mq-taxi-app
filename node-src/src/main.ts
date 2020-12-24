import amqp from "amqplib"
/* eslint-disable no-undef */
import { taxiSubscribeByTopic, taxiSubscribeDirect } from "./consumer"
import { getChannel } from "./getChannel"
import { orderTaxiByTopic, orderTaxiDirect } from "./publisher"
import { appConfig } from "./config"
import { getExchange } from "./getExchange"
import { ExchangeTypes } from "./types.dt"
import { declareQueue } from "./declareQueue"
import { ConsumeMessage } from "amqplib"

async function main() {
  const channel = await getChannel(appConfig.rabbitmqURI)

  const basicTaxis = ["taxi-1", "taxi-2"]
  const echoTaxis = ["taxi-3", "taxi-4"]
  const generalAnouncementQueues = [
    "taxi-1-GA",
    "taxi-2-GA",
    "taxi-3-GA",
    "taxi-4-GA",
  ]

  const fanoutExchange = await getExchange({
    channel,
    name: "general_anouncement",
    type: ExchangeTypes.FANOUT,
  })

  await Promise.all(
    generalAnouncementQueues.map((taxiName) =>
      declareQueue({ channel, taxiName }).then(
        async (queue: amqp.Replies.AssertQueue) => {
          console.log(queue.queue)
          await channel.bindQueue(queue.queue, fanoutExchange.exchange, "")
          // NOTE: can there be multiple handlers in one queue?
          await channel.consume(
            queue.queue,
            (message: ConsumeMessage | null) => {
              if (!message) return
              try {
                console.log(`Received ${message.content}`)
                channel.ack(message)
              } catch (error) {
                console.error(error.message)
                channel.nack(message)
              }
            },
            {
              noAck: false,
            }
          )
        }
      )
    )
  )

  channel.publish(
    fanoutExchange.exchange,
    "",
    Buffer.from("Hello from CC Headquarter!")
  )

  const directExchange = await getExchange({
    channel,
    name: "taxi",
    type: ExchangeTypes.DIRECT,
  })

  const directQueues = await Promise.all(
    basicTaxis.map((taxiName) => declareQueue({ channel, taxiName }))
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
    echoTaxis.map((taxiName) => declareQueue({ channel, taxiName }))
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
  await Promise.all(
    keys.map((key) =>
      orderTaxiByTopic({
        channel,
        exchange: ecoExchange,
        key,
      })
    )
  )
}

main().catch((error: NodeJS.ErrnoException) => console.error(error.message))
