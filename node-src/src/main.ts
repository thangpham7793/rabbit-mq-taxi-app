/* eslint-disable no-undef */
import { appConfig } from "./config"
import { taxiSubscribe } from "./consumer"
import { getChannel } from "./getChannel"
import { init } from "./init"
import { orderTaxi } from "./publisher"

async function main() {
  const channel = await getChannel(appConfig.rabbitmqURI)

  const taxiOneConfig = await init({
    channel,
    taxiName: "taxi-1",
    exchangeName: "taxi-direct",
    exchangeType: "direct",
  })

  const taxiTwoConfig = await init({
    channel,
    taxiName: "taxi-2",
    exchangeName: "taxi-direct",
    exchangeType: "direct",
  })

  await taxiSubscribe(taxiOneConfig)
  await taxiSubscribe(taxiTwoConfig)
  await orderTaxi(taxiOneConfig)
  await orderTaxi(taxiTwoConfig)
}

main()
