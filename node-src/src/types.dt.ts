import amqp from "amqplib"

export enum ExchangeTypes {
  "DIRECT" = "direct",
  "TOPIC" = "topic",
}

export type TaxiQueueAndExchange = {
  channel: amqp.Channel
  taxiName: string
  exchange: amqp.Replies.AssertExchange
}

export type GetExchangeProps = {
  channel: amqp.Channel
  name: string
  type: ExchangeTypes
}
