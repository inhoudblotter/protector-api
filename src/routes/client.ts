import { Router } from "express";
import { updateClient } from "database/client/updateClient";
import { auth } from "middlewares/auth";
import { isClientUpdate } from "types/typeGuards/isClientUpdate";

const router = Router();

router.patch("/:id", auth(), async (req, res, next) => {
  const id = Number(req.params.id);
  if (isClientUpdate(req.body) && !isNaN(id)) {
    try {
      const clientId = await updateClient(req.db, req.body);
      return res.status(200).json({
        id: clientId,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "NotFound") {
        return res.status(404).json({
          code: 404,
          message: "Клиент не найден.",
        });
      }
      res.status(500).json({
        code: 500,
        message: "Ошибка при обновлении клиента.",
      });
      return next(error);
    }
  }
  return res.status(400).json({
    code: 400,
    message: "Запрос содержит некорректную информацию.",
  });
});

export default router;
