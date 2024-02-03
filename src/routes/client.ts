import { Router } from "express";
import { updateClient } from "src/database/client/updateClient";
import { auth } from "src/middlewares/auth";
import { isClientUpdate } from "src/types/typeGuards/isClientUpdate";

const router = Router();

router.patch("/:id", auth(), async (req, res) => {
  const id = Number(req.params.id);
  if (isClientUpdate(req.body) && !isNaN(id)) {
    try {
      const clientId = await updateClient(req.db, req.body);
      if (!clientId) throw new Error("Failed to update client.");
      return res.status(200).json({
        id: clientId,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "NotFound") {
        return res.status(404).json({
          code: 404,
          message: "Client not found.",
        });
      }
      console.error(error);
      return res.status(500).json({
        code: 500,
        message: "Failed to update client.",
      });
    }
  }
  return res.status(400).json({
    code: 400,
    message: "The request contains incorrect client information.",
  });
});

export default router;
