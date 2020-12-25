import { appConfig } from "./../../config"
import { getChannel } from "./index"
import amqp from "amqplib"

interface QueueService {
  getQueues(): string[]
}

export class TaxiQueueService implements QueueService {
  private static _channel: amqp.Channel
  private static _instance: TaxiQueueService

  private _queue: string[]
  private constructor() {
    this._queue = []
  }

  getQueues() {
    TaxiQueueService._channel.assertQueue("taxi")
    return this._queue
  }

  public static async getInstance() {
    if (!this._channel) {
      this._channel = await getChannel(appConfig.rabbitmqURI)
    }
    if (!this._instance) TaxiQueueService._instance = new TaxiQueueService()
    return this._instance
  }
}
