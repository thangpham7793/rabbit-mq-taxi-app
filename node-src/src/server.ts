import { appConfig } from "./config"
import express, { Request, Response } from "express"

const app = express()

app.get("/taxi", (_: Request, res: Response) => {
  res.status(200)
})

app.listen(appConfig.PORT, () => {
  console.log(`Taxi Server Listening On ${appConfig.PORT}`)
})
