import { Router } from "express";
import { SESSION_COOKIE } from "config/constants";
import { addUser } from "database/user/addUser";
import { addSession } from "database/session/addSession";
import { getUser } from "database/user/getUser";
import { isUser } from "types/typeGuards/isUser";
import { getHash } from "utils/getHash";
import { auth } from "middlewares/auth";
import { deleteSession } from "database/session/deleteSession";
import { isToken as isTokenType } from "types/typeGuards/isToken";
import { isToken } from "database/registerTokens/isToken";
import { addToken } from "database/registerTokens/addToken";

const router = Router();

router.get("/", auth(), async (req, res) => {
  if (!req.userId)
    return res.status(401).json({
      code: 401,
      message: "Unauthorized",
    });
  res.status(200).json({
    id: req.userId,
  });
});

router.post("/login", async (req, res, next) => {
  if (isUser(req.body)) {
    try {
      const user = await getUser(req.db, req.body);
      if (!user)
        return res.status(404).json({
          code: 404,
          message: "Пользователь не найден.",
        });

      if (user.pass !== getHash(req.body.password))
        return res.status(401).json({
          code: 401,
          message: "Неверный пароль.",
        });

      const token = await addSession(req.db, user.id);
      res.cookie("token", token, SESSION_COOKIE);

      return res.status(200).json({
        id: user.id,
      });
    } catch (error) {
      res
        .status(500)
        .json({ code: 500, message: "При авторизации возникла ошибка." });
      return next(error);
    }
  }
  return res.status(500).json({
    code: 500,
    message: "Отправлены некорректные данные.",
  });
});

router.post("/register", async (req, res, next) => {
  const registerToken = req.query.token;
  if (isUser(req.body) && isTokenType(registerToken)) {
    try {
      const passedToken = await isToken(req.db, registerToken);
      if (!passedToken)
        return res.status(401).json({
          code: 401,
          message: "Токен регистрации не найден.",
        });
      const id = await addUser(req.db, req.body);
      if (!id)
        return res.status(422).json({
          code: 422,
          message: "Такой пользователь уже существует.",
        });

      const token = await addSession(req.db, id);
      res.cookie("token", token, SESSION_COOKIE);

      return res.status(201).json({
        id,
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: "Ошибка при создании нового пользователя.",
      });
      return next(error);
    }
  }
  return res.status(400).json({
    code: 400,
    message: "Некорректная информация о пользователе.",
  });
});

router.get("/register/new", auth(), async (req, res, next) => {
  try {
    const token = await addToken(req.db);
    return res.status(200).json({
      token,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Ошибка при создании токена.",
    });
    return next(error);
  }
});

router.get("/register/:token", async (req, res, next) => {
  const token = req.params.token;
  if (isTokenType(token)) {
    try {
      const passed = await isToken(req.db, token);
      if (passed) {
        return res.sendStatus(200);
      } else
        return res.status(401).json({
          code: 401,
          message: "Токен не найден",
        });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: "Ошибка при проверке токена регистрации.",
      });
      next(error);
    }
  } else {
    res.status(400).json({
      code: 400,
      message: "Некорректный токен регистации",
    });
  }
});

router.get("/logout", auth(), async (req, res) => {
  try {
    await deleteSession(req.db, req.cookies.token);
    res.cookie("token", "", { maxAge: 0 });
    return res.sendStatus(204);
  } catch (error) {
    if (error instanceof Error && error.message === "NotFound")
      return res.status(404).json({ code: 404, message: "Session not found" });
    console.error(error);
    return res
      .status(500)
      .json({ code: 500, message: "Failed to delete session" });
  }
});

export default router;
