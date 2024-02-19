import { ErrorRequestHandler } from "express";
import { botSendMessage } from "utils/botSendMessage";

export function errorHandler() {
  const middleware: ErrorRequestHandler = (error, _req, _res, _next) => {
    console.error(error);
    botSendMessage(
      Number(process.env.ADMIN_CHAT_ID),
      `Возникла ошибка\n${error}`
    ).catch((error) => console.error(error));
  };
  return middleware;
}
