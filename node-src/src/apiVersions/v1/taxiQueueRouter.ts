import { Request, Response, Router } from "express"

const taxiQueueRouter: Router = Router()
taxiQueueRouter.get("/queues", (_: Request, res: Response) => {
  res.status(200).send({ status: "success", data: ["available queues"] })
})

export default taxiQueueRouter
