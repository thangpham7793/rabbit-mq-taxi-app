/* eslint-disable no-undef */
import { taxiSubscribeByTopic, taxiSubscribeDirect } from "./consumer"
import { getChannel } from "./getChannel"
import { initDirectQueue } from "./initDirectQueue"
import { orderTaxiByTopic, orderTaxiDirect } from "./publisher"
import { initTopicQueue } from "./initTopicQueue"
import { appConfig } from "./config"
import { getExchange } from "./getExchange"
import { ExchangeTypes } from "./types.dt"

async function main() {
  const channel = await getChannel(appConfig.rabbitmqURI)
  const directExchange = await getExchange({
    channel,
    name: "taxi",
    type: ExchangeTypes.DIRECT,
  })

  const directQueues = await Promise.all(
    ["taxi-1", "taxi-2"].map((taxiName) =>
      initDirectQueue({
        channel,
        taxiName,
        exchange: directExchange,
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

  // seems like individual direct queue is not needed in this situation
  const ecoExchange = await getExchange({
    channel,
    name: "taxi-topic",
    type: ExchangeTypes.TOPIC,
  })

  const ecoTopicQueues = await Promise.all(
    ["taxi-3", "taxi-4"].map((taxiName) =>
      initTopicQueue({
        channel,
        taxiName,
        exchange: ecoExchange,
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
