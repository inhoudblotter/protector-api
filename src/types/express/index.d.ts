import { Client } from "pg";

declare global {
  declare namespace Express {
    interface Request {
      db: Client;
      userId?: number;
    }
  }
}
