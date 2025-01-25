import {registerAs} from "@nestjs/config";
import * as process from "node:process";

export const CONFIG_DATABASE = "database";

export default registerAs(CONFIG_DATABASE, () => ({
  users: {
    uri: "mongodb+srv://fzoirov29:9hbVYteBL35W9vu5@cluster0.yycvn5d.mongodb.net/veb-sayt-umft?retryWrites=true&w=majority&appName=Cluster0"
  }
}));


