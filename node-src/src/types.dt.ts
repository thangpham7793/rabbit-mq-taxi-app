import amqp from "amqplib"

export type TaxiQueueAndExchange = {
  channel: amqp.Channel
  taxiName: string
  exchangeName: string
}
