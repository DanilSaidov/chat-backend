import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";

import "./core/db.js";
import createRoutes from "./core/routes.js";
import createSocket from "./core/socket.js";

const app = express();
const http = createServer(app);
const io = createSocket(http);
createRoutes(app, io);
dotenv.config();

http.listen(process.env.PORT, () => {
  console.log(`Example app listening at http://localhost:${process.env.PORT}`);
});
