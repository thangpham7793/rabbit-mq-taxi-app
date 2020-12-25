import { GetExchangeProps } from "./types.dt"

export async function getExchange({ channel, name, type }: GetExchangeProps) {
  return await channel.assertExchange(name, type, {
    durable: true,
    autoDelete: false, // persist exchange even when there's no queue binded to it
  })
}
