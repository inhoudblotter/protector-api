import { Router } from "express";
import { getSettings } from "database/settings/getSettings";
import { updateSettings } from "database/settings/updateSettings";
import { auth } from "middlewares/auth";
import { isSettings } from "types/typeGuards/isSettings";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const settings = await getSettings(req.db);
    return res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Ошибка при загрузке настроек.",
    });
    return next(error);
  }
});

router.patch("/", auth(), async (req, res, next) => {
  if (isSettings(req.body)) {
    try {
      const isUpdated = await updateSettings(req.db, req.body);
      if (isUpdated) return res.sendStatus(201);
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: "Ошибка при обновлении настроек.",
      });
      return next(error);
    }
  } else {
    return res.status(400).json({
      code: 400,
      message: "Переданы некорректные данные для обновления настроек.",
    });
  }
});

export default router;
