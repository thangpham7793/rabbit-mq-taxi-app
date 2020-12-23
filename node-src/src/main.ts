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
    name: "taxi-direct",
    type: ExchangeTypes.DIRECT,
  })

  const taxiOneQueue = await initDirectQueue({
    channel,
    taxiName: "taxi-1",
    exchange: directExchange,
  })

  const taxiTwoQueue = await initDirectQueue({
    channel,
    taxiName: "taxi-2",
    exchange: directExchange,
  })

  const ecoExchange = await getExchange({
    channel,
    name: "taxi.eco",
    type: ExchangeTypes.TOPIC,
  })

  const taxiThreeQueue = await initTopicQueue({
    channel,
    taxiName: "taxi-3",
    exchange: ecoExchange,
  })

  const taxiFourQueue = await initTopicQueue({
    channel,
    taxiName: "taxi-4",
    exchange: ecoExchange,
  })

  await taxiSubscribeDirect({
    channel,
    exchange: directExchange,
    queue: taxiOneQueue,
  })
  await taxiSubscribeDirect({
    channel,
    exchange: directExchange,
    queue: taxiTwoQueue,
  })

  await taxiSubscribeByTopic({
    channel,
    exchange: ecoExchange,
    queue: taxiThreeQueue,
    key: "eco",
  })
  await taxiSubscribeByTopic({
    channel,
    exchange: ecoExchange,
    queue: taxiFourQueue,
    key: "eco",
  })

  await orderTaxiDirect({
    channel,
    exchange: directExchange,
    queue: taxiOneQueue,
  })
  await orderTaxiDirect({
    channel,
    exchange: directExchange,
    queue: taxiTwoQueue,
  })
  await orderTaxiByTopic({
    channel,
    exchange: ecoExchange,
    queue: taxiThreeQueue,
    key: "eco",
  })
}

main()
