/* eslint-disable no-undef */
import dotenv from "dotenv"
import path from "path"
dotenv.config({
  path: path.join(__dirname, ".env"),
})

export const appConfig = {
  rabbitmqURI: process.env.RABBITMQ_URI as string,
}
