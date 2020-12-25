import { appConfig } from "./config"
import express from "express"
import v1Router from "./apiVersions/v1Router"

const app = express()

app.use(express.json())
app.use("/v1", v1Router)

app.listen(appConfig.PORT, () => {
  console.log(`Taxi Server Listening On ${appConfig.PORT}`)
})
