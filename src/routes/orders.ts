import { Router } from "express";
import { getOrders } from "database/orders/getOrders";
import { getOrdersByDate } from "database/orders/getOrdersByDate";
import { getOrderStats } from "database/orders/getOrdersStats";
import { auth } from "middlewares/auth";
import { isDate } from "types/typeGuards/isDate";
import { getFilters } from "utils/getFilters";
import { getSortSettings } from "utils/getSortSettings";

const router = Router();

router.get("/", auth(), async (req, res, next) => {
  try {
    const date = req.query.date;
    let data;
    if (isDate(date)) {
      data = await getOrdersByDate(req.db, date);
    } else {
      const limit = Number(req.query.limit) || 15;
      const offset = Number(req.query.offset) || 0;
      const filters = getFilters(req.query);
      const SortSettings = getSortSettings(
        req.query.sortBy?.toString(),
        req.query.sortDirection?.toString()
      );
      data = await getOrders(req.db, limit, offset, filters, SortSettings);
    }
    return res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Ошибка при загрузки заявок.",
    });
    return next(error);
  }
});

router.get("/old", auth(), async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 15;
    const offset = Number(req.query.offset) || 0;
    const filters = getFilters(req.query);
    const SortSettings = getSortSettings(
      req.query.sortBy?.toString(),
      req.query.sortDirection?.toString()
    );
    const data = await getOrders(
      req.db,
      limit,
      offset,
      filters,
      SortSettings,
      true
    );
    return res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Ошибка при загруке заявок.",
    });
    return next(error);
  }
});

router.get("/stats", auth(), async (req, res, next) => {
  const { from, to } = req.query;
  if (isDate(from) && isDate(to)) {
    try {
      const stats = await getOrderStats(req.db, from, to);
      return res.json(stats);
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: "Ошибка при получении статистики.",
      });
      return next(error);
    }
  } else
    return res.status(400).json({
      code: 400,
      message: "Некорректные параметры запроса.",
    });
});

export default router;
