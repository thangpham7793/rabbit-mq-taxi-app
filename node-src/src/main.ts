import { taxiSubscribe } from "./consumer"
import { init } from "./createQueueAndExchange"
import { orderTaxi } from "./publisher"

async function main() {
  const taxiOneConfig = await init({
    taxiName: "taxi-1",
    taxiExchange: "taxi-direct",
  })
  const taxiTwoConfig = await init({
    taxiName: "taxi-2",
    taxiExchange: "taxi-direct",
  })
  await taxiSubscribe(taxiOneConfig)
  await orderTaxi(taxiOneConfig)
  await taxiSubscribe(taxiTwoConfig)
  await orderTaxi(taxiTwoConfig)
}

main()
