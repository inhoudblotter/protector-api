import { Pool } from "pg";

declare global {
  declare namespace Express {
    interface Request {
      db: Pool;
      userId?: number;
    }
  }
}
