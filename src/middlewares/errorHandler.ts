import { ErrorRequestHandler } from "express";

export function errorHandler() {
  const middleware: ErrorRequestHandler = (err, _req, _res, _next) => {
    console.error(err);
  };
  return middleware;
}
