import { Router } from "express";
import { getOrders } from "src/database/orders/getOrders";
import { getOrdersByDate } from "src/database/orders/getOrdersByDate";
import { getOrderStats } from "src/database/orders/getOrdersStats";
import { auth } from "src/middlewares/auth";
import { isDate } from "src/types/typeGuards/isDate";
import { getFilters } from "src/utils/getFilters";
import { getSortSettings } from "src/utils/getSortSettings";

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
      message: "Failed to load orders",
    });
    return next(error);
  }
});

router.get("/old", auth(), async (req, res) => {
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
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Failed to load orders",
    });
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
      next(error);
    }
  } else
    return res.status(400).json({
      code: 400,
      message: "Некорректные параметры запроса.",
    });
});

export default router;
