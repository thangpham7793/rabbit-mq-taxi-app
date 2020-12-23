/* eslint-disable no-undef */
import { appConfig } from "./config"
import { taxiSubscribeByTopic, taxiSubscribeDirect } from "./consumer"
import { getChannel } from "./getChannel"
import { initDirectExchange } from "./initDirectExchange"
import { orderTaxiByTopic, orderTaxiDirect } from "./publisher"
import { initTopicExchange } from "./initTopicExchange"

async function main() {
  const channel = await getChannel(appConfig.rabbitmqURI)

  const taxiOneConfig = await initDirectExchange({
    channel,
    taxiName: "taxi-1",
    exchangeName: "taxi-direct",
  })

  const taxiTwoConfig = await initDirectExchange({
    channel,
    taxiName: "taxi-2",
    exchangeName: "taxi-direct",
  })

  const taxiThreeConfig = await initTopicExchange({
    channel,
    taxiName: "taxi-3",
    exchangeName: "taxi.eco",
  })

  const taxiFourConfig = await initTopicExchange({
    channel,
    taxiName: "taxi-4",
    exchangeName: "taxi.eco",
  })

  await taxiSubscribeDirect({ ...taxiOneConfig, channel })
  await taxiSubscribeDirect({ ...taxiTwoConfig, channel })

  await taxiSubscribeByTopic({ ...taxiThreeConfig, channel, key: "eco" })
  await taxiSubscribeByTopic({ ...taxiFourConfig, channel, key: "eco" })

  await orderTaxiDirect({ ...taxiOneConfig, channel })
  await orderTaxiDirect({ ...taxiTwoConfig, channel })
  await orderTaxiByTopic({ ...taxiThreeConfig, channel, key: "eco" })
}

main()
