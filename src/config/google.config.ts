import {registerAs} from "@nestjs/config";
import * as dotenv from "dotenv";
import * as process from "node:process";

dotenv.config();

export const GOOGLE_BASED = 'GOOGLE_BASED';

export default registerAs(GOOGLE_BASED, () => ({
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
}))






