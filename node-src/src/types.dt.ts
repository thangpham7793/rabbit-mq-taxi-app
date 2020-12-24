import amqp from "amqplib"

export enum ExchangeTypes {
  "DIRECT" = "direct",
  "TOPIC" = "topic",
}

interface BaseProps {
  channel: amqp.Channel
  exchange: amqp.Replies.AssertExchange
}

export type TaxiQueueAndExchange = BaseProps & {
  taxiName: string
}

export type GetExchangeProps = {
  channel: amqp.Channel
  name: string
  type: ExchangeTypes
}

export type SubscribeByTopicProps = BaseProps & {
  queue: amqp.Replies.AssertQueue
  key: string
}

export type SubscribeDirectProps = BaseProps & {
  queue: amqp.Replies.AssertQueue
}

export type OrderTaxiDirectProp = BaseProps & {
  queue: amqp.Replies.AssertQueue
}

export type OrderTaxiByTopicProp = BaseProps & {
  key: string
}
