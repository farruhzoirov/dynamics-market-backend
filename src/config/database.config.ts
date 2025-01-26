import {registerAs} from "@nestjs/config";
import * as process from "node:process";

import * as dotenv from "dotenv";

dotenv.config();

export const CONFIG_DATABASE = "database";

export default registerAs(CONFIG_DATABASE, () => ({
  users: {
    uri: process.env.MONGODB_URI,
  }
}));


