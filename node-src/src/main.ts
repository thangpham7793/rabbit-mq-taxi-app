import { taxiSubscribe } from "./consumer"
import { init } from "./createQueueAndExchange"
import { orderTaxi } from "./publisher"

async function main() {
  const { channel, exchange, queue } = await init({
    taxiName: "taxi",
    taxiExchange: "taxi-direct",
  })
  await taxiSubscribe({ channel, queue, exchange })
  await orderTaxi({ channel, queue, exchange })
}

main()
