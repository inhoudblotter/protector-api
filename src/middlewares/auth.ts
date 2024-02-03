import { RequestHandler } from "express";
import { SESSION_COOKIE } from "src/config/constants";
import { getSession } from "src/database/session/getSession";
import { updateSession } from "src/database/session/updateSession";

export function auth() {
  const middleware: RequestHandler = async (req, res, next) => {
    const token =
      req.cookies["token"] || req.headers.authorization?.split(" ")[1];
    if (token) {
      try {
        const session = await getSession(req.db, token);
        if (session) {
          req.userId = session.user_id;
          if (
            new Date().getTime() -
              new Date(session.creation_timestamp).getTime() >
            3 * 24 * 60 * 60 * 1000
          ) {
            const newToken = await updateSession(
              req.db,
              session.user_id,
              token
            );
            res.cookie("token", newToken, SESSION_COOKIE);
          }
          return next();
        }
      } catch (error) {
        if (error instanceof Error && error.message === "NotFound")
          return res.status(401).json({
            code: 401,
            message: "Вы не авторизованы",
          });
        console.error(error);
        res.status(500).json({
          code: 500,
          message: "Ошибка аутентификации",
        });
      }
    }
    return res.status(401).json({
      code: 401,
      message: "Не передан токен авторизации",
    });
  };
  return middleware;
}
