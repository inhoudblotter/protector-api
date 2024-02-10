import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { Client } from "pg";
import { database } from "./middlewares/database";
import clientRouter from "routes/client";
import orderRouter from "routes/order";
import authRouter from "routes/auth";
import ordersRouter from "routes/orders";
import settingsRouter from "routes/settings";
import freeTimeRouter from "routes/freeTime";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

async function main() {
  const app = express();

  const databaseClient = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
  });
  await databaseClient.connect();

  app.use(
    cors({
      origin: ["http://localhost:5173"],
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));
  app.use(database(databaseClient));

  app.use("/client", clientRouter);
  app.use("/order", orderRouter);
  app.use("/auth", authRouter);
  app.use("/orders", ordersRouter);
  app.use("/settings", settingsRouter);
  app.use("/free-time", freeTimeRouter);
  app.use(errorHandler());

  const PORT = process.env.PORT || 3007;

  app.listen(PORT, () => {
    console.log("Server started on http://localhost:" + PORT);
  });
}

main();
