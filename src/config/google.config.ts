import {registerAs} from "@nestjs/config";
import * as process from "node:process";


export default registerAs('google', () => ({
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_KEY: process.env.CLIENT_KEY,
}))






