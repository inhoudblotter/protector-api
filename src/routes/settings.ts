import { Router } from "express";
import { getSettings } from "database/settings/getSettings";
import { updateSettings } from "database/settings/updateSettings";
import { auth } from "middlewares/auth";
import { isSettings } from "types/typeGuards/isSettings";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const settings = await getSettings(req.db);
    return res.status(200).json(settings);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Failed to load settings",
    });
  }
});

router.patch("/", auth(), async (req, res) => {
  if (isSettings(req.body)) {
    try {
      const isUpdated = await updateSettings(req.db, req.body);
      if (isUpdated) return res.sendStatus(201);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        code: 500,
        message: "Failed to update settings",
      });
    }
  } else {
    return res.status(400).json({
      code: 400,
      message: "The request body contains incorrect order information",
    });
  }
});

export default router;
