import { Router } from "express";
import { getOrdersSliceForCheck } from "src/database/orders/getOrdersSliceForCheck";
import { getSettings } from "src/database/settings/getSettings";
import { isDate } from "src/types/typeGuards/isDate";
import { isServices } from "src/types/typeGuards/isServices";
import { getFreeDays } from "src/utils/getFreeDays";
import { getFreeTime } from "src/utils/getFreeTime";
import { getLeadTime } from "src/utils/getLeadTime";
import { getStartEndDay } from "src/utils/getStartEndDay";
import { getStartEndExtendedMonth } from "src/utils/getStartEndExtendedMonth";

const router = Router();

router.get("/month/:date", async (req, res, next) => {
  const date = req.params.date;
  let { services, wheels } = req.query;
  services = typeof services === "string" ? services.split(",") : undefined;
  const quantityWheels = Number(wheels);
  if (isDate(date) && isServices(services) && !isNaN(quantityWheels)) {
    try {
      const settings = await getSettings(req.db);
      const { start, end } = getStartEndExtendedMonth(date);
      const orders = await getOrdersSliceForCheck(req.db, start, end);
      const leadTime = getLeadTime(services, quantityWheels, settings.services);
      const days = getFreeDays(
        start,
        end,
        orders,
        leadTime,
        settings.work_time,
        settings.services
      );
      return res.status(200).json(days);
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: "Ошибка при расчёте свободный дат.",
      });
      return next(error);
    }
  } else {
    return res.status(400).json({
      code: 400,
      message: "Некорретные параметры запроса для расчёта свободных дат",
    });
  }
});

router.get("/day/:date", async (req, res, next) => {
  const date = req.params.date;
  let { services, wheels } = req.query;
  services = typeof services === "string" ? services.split(",") : undefined;
  const quantityWheels = Number(wheels);
  if (isDate(date) && isServices(services) && !isNaN(quantityWheels)) {
    try {
      const settings = await getSettings(req.db);
      const { start, end } = getStartEndDay(date, settings.work_time);
      const orders = await getOrdersSliceForCheck(req.db, start, end);
      const leadTime = getLeadTime(services, quantityWheels, settings.services);
      const freeTime = getFreeTime(
        date,
        orders,
        leadTime,
        settings.work_time,
        settings.services
      );
      return res.status(200).json(freeTime);
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: "Ошибка при расчёте свободного времени.",
      });
      return next(error);
    }
  } else {
    return res.status(400).json({
      code: 400,
      message: "Некорретные параметры запроса для расчёта свободного времени",
    });
  }
});

export default router;
