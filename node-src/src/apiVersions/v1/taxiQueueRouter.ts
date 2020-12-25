import { Request, Response, Router } from "express"
import { TaxiQueueService } from "../../services/taxiQueue/index"

const taxiQueueRouter: Router = Router()

taxiQueueRouter.get("/queues", async (_: Request, res: Response) => {
  const taxiQueueService = await TaxiQueueService.getInstance()
  const queues = taxiQueueService.getQueues()
  res.status(200).send({ status: "success", data: queues })
})

taxiQueueRouter.post(
  "/queues/:queueId/subscribe/",
  (req: Request, res: Response) => {
    res.status(200).send({
      status: "success",
      data: { message: `Subscribed to queue ${req.params.queueId}` },
    })
  }
)

taxiQueueRouter.post(
  "/exchanges/:exchangeId/publish/",
  (req: Request, res: Response) => {
    res.status(200).send({
      status: "success",
      data: { message: `Received ${req.body.message}!` },
    })
  }
)

export default taxiQueueRouter
