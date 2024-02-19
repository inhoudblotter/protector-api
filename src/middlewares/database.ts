import { RequestHandler } from "express";
import { Pool } from "pg";

export function database(client: Pool) {
  const middleware: RequestHandler = (req, _, next) => {
    req.db = client;
    next();
  };
  return middleware;
}
