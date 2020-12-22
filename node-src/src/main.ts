/* eslint-disable no-undef */
import { appConfig } from "./config"
import { taxiSubscribeByTopic, taxiSubscribeDirect } from "./consumer"
import { ExchangeTypes } from "./ExchangeTypes"
import { getChannel } from "./getChannel"
import { init } from "./init"
import { orderTaxiByTopic, orderTaxiDirect } from "./publisher"

async function main() {
  const channel = await getChannel(appConfig.rabbitmqURI)

  const taxiOneConfig = await init({
    channel,
    taxiName: "taxi-1",
    exchangeName: "taxi-direct",
    exchangeType: ExchangeTypes.DIRECT,
  })

  const taxiTwoConfig = await init({
    channel,
    taxiName: "taxi-2",
    exchangeName: "taxi-direct",
    exchangeType: ExchangeTypes.DIRECT,
  })

  const taxiThreeConfig = await init({
    channel,
    taxiName: "taxi-3",
    exchangeName: "taxi.eco",
    exchangeType: ExchangeTypes.TOPIC,
  })

  const taxiFourConfig = await init({
    channel,
    taxiName: "taxi-4",
    exchangeName: "taxi.eco",
    exchangeType: ExchangeTypes.TOPIC,
  })

  await taxiSubscribeDirect(taxiOneConfig)
  await taxiSubscribeDirect(taxiTwoConfig)
  await taxiSubscribeByTopic({ ...taxiThreeConfig, key: "eco" })
  await taxiSubscribeByTopic({ ...taxiFourConfig, key: "eco" })

  await orderTaxiDirect(taxiOneConfig)
  await orderTaxiDirect(taxiTwoConfig)
  await orderTaxiByTopic({ ...taxiThreeConfig, key: "eco" })
}

main()
