import { Router } from "express";
import { updateCar } from "src/database/cars/updateCar";
import { updateClient } from "src/database/client/updateClient";
import { addOrder } from "src/database/order/addOrder";
import { deleteOrder } from "src/database/order/deleteOrder";
import { doneOrder } from "src/database/order/doneOrder";
import { getOrder } from "src/database/order/getOrder";
import { updateOrder } from "src/database/order/updateOrder";
import { getOrdersSliceForCheck } from "src/database/orders/getOrdersSliceForCheck";
import { getSettings } from "src/database/settings/getSettings";
import { auth } from "src/middlewares/auth";
import { isNewOrder } from "src/types/typeGuards/isNewOrder";
import { isOrderUpdate } from "src/types/typeGuards/isOrderUpdate";
import { checkCorrectOrderInsert } from "src/utils/checkCorrectOrderInsert";
import { getCompletionTimestamp } from "src/utils/getCompletionTimestamp";
import { getLeadTime } from "src/utils/getLeadTime";

const router = Router();

router.post("/", async (req, res) => {
  if (isNewOrder(req.body)) {
    const { services, client, date, wheels } = req.body;
    try {
      const settings = await getSettings(req.db);
      const leadTime = getLeadTime(
        services,
        wheels.quantity,
        settings.services
      );
      const completionTimestamp = getCompletionTimestamp(date, leadTime);
      const orderID = await addOrder(
        req.db,
        client,
        services,
        date,
        wheels,
        completionTimestamp
      );
      const dayStart = new Date(date);
      dayStart.setHours(
        settings.work_time.from.hours,
        settings.work_time.from.minutes,
        0,
        0
      );
      const orders = await getOrdersSliceForCheck(
        req.db,
        dayStart.toISOString(),
        completionTimestamp,
        date
      );
      const passed = checkCorrectOrderInsert(orders, date, settings.services);
      if (!passed) {
        res.status(406).json({
          code: 406,
          message:
            "Данное время уже занято другим клиентом. Попробуйте выбрать другое.",
        });
        await deleteOrder(req.db, orderID);
        return;
      } else
        return res.status(201).json({
          id: orderID,
        });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        code: 500,
        message: "Что-то пошло не так...",
      });
    }
  }
  return res.status(400).json({
    code: 400,
    message: "Заявка содержит некорректную информацию.",
  });
});

router.get("/:id", auth(), async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id))
    return res.status(400).json({
      code: 400,
      message: "ID must be a number",
    });

  try {
    const order = await getOrder(req.db, id);
    return res.status(200).json(order);
  } catch (error) {
    if (error instanceof Error && error.message === "Not found") {
      return res.status(404).json({
        code: 404,
        message: "Order not found",
      });
    }
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Failed to load order",
    });
  }
});

router.patch("/:id", auth(), async (req, res) => {
  const id = Number(req.params.id);
  if (isOrderUpdate(req.body) && !isNaN(id)) {
    const { services, date, client, price } = req.body;
    try {
      let clientId: number | undefined = undefined;
      let carId: number | undefined = undefined;
      if (client) {
        clientId = await updateClient(req.db, client);
        if ((client.carType || client.carNumber) && client.carId) {
          carId = await updateCar(req.db, client);
        }
      }

      const orderId = await updateOrder(req.db, id, services, date, price);
      if (!orderId) throw new Error("Failed to update order.");
      return res.status(200).json({
        id: orderId,
        clientId,
        carId,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "NotFound") {
        return res.status(404).json({
          code: 404,
          message: "Order not found.",
        });
      }
      console.error(error);
      return res.status(500).json({
        code: 500,
        message: "Failed to update order.",
      });
    }
  }
  return res.status(400).json({
    code: 400,
    message: "The request contains incorrect order information",
  });
});

router.delete("/:id", auth(), async (req, res) => {
  const id = Number(req.params.id);
  if (!isNaN(id)) {
    try {
      const deletedId = await deleteOrder(req.db, id);
      return res.status(200).json({
        id: deletedId,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Not Found") {
        return res.status(404).json({
          code: 404,
          message: "Order not found",
        });
      } else {
        console.error(error);
        return res.status(500).json({
          code: 500,
          message: "Internal error",
        });
      }
    }
  }
  return res.status(400).json({
    code: 400,
    message: "The request contains incorrect order information",
  });
});

router.patch("/:id/done", auth(), async (req, res) => {
  const id = Number(req.params.id);

  if (!isNaN(id)) {
    try {
      const newId = await doneOrder(req.db, id);
      return res.status(200).json({
        id: newId,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Not Found") {
        return res.status(404).json({
          code: 404,
          message: "Order not found",
        });
      } else {
        console.error(error);
        return res.status(500).json({
          code: 500,
          message: "Internal error",
        });
      }
    }
  }
  return res.status(400).json({
    code: 400,
    message: "The request contains incorrect order information",
  });
});

export default router;
