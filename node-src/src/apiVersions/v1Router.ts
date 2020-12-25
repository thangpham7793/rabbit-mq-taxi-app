import { Router } from "express"
import taxiQueueRouter from "./v1/taxiQueueRouter"

const v1Router = Router()
v1Router.use("/taxi", taxiQueueRouter)

export default v1Router
