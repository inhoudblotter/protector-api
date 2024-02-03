import { RequestHandler } from "express";
import { Client } from "pg";

export function database(client: Client) {
  const middleware: RequestHandler = (req, _, next) => {
    req.db = client;
    next();
  };
  return middleware;
}
