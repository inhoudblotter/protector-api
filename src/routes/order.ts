import { Router } from "express";
import { updateCar } from "database/cars/updateCar";
import { updateClient } from "database/client/updateClient";
import { addOrder } from "database/order/addOrder";
import { deleteOrder } from "database/order/deleteOrder";
import { doneOrder } from "database/order/doneOrder";
import { getOrder } from "database/order/getOrder";
import { updateOrder } from "database/order/updateOrder";
import { getOrdersSliceForCheck } from "database/orders/getOrdersSliceForCheck";
import { getSettings } from "database/settings/getSettings";
import { auth } from "middlewares/auth";
import { isNewOrder } from "types/typeGuards/isNewOrder";
import { isOrderUpdate } from "types/typeGuards/isOrderUpdate";
import { checkCorrectOrderInsert } from "utils/checkCorrectOrderInsert";
import { getCompletionTimestamp } from "utils/getCompletionTimestamp";
import { getLeadTime } from "utils/getLeadTime";
import { IServices } from "types/IServices";
import { ISettings } from "types/ISettings";
import { IOrder } from "types/IOrder";
import { botSendMessage } from "utils/botSendMessage";
import { getSubscribers } from "database/subscribersTelegram/getSubscribers";
import { SERVICES_NAMES } from "config/constants";

const router = Router();

router.post("/", async (req, res, next) => {
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
        leadTime,
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
        res.status(201).json({
          id: orderID,
        });
      const subscribers = await getSubscribers(req.db);
      const services_names = services
        .map((s) => SERVICES_NAMES.get(s))
        .join(",");
      const message = `Новая запись <a href='${
        process.env.ADMIN_HOST
      }/orders/${orderID}'>№ ${orderID}</a>\n\nИмя: ${client.name}\nТелефон: ${
        client.phone
      }\nНомер машины: ${client.carNumber}${
        client.carType ? `\nТип машины: ${client.carType}` : ""
      }\nУслуги: ${services_names}`;
      subscribers.forEach((subscriber) =>
        botSendMessage(subscriber.chat_id, message)
      );
      return;
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: "Что-то пошло не так...",
      });
      return next(error);
    }
  }
  return res.status(400).json({
    code: 400,
    message: "Заявка содержит некорректную информацию.",
  });
});

router.get("/:id", auth(), async (req, res, next) => {
  const id = Number(req.params.id);
  if (isNaN(id))
    return res.status(400).json({
      code: 400,
      message: "ID должно быть числом",
    });

  try {
    const order = await getOrder(req.db, id);
    return res.status(200).json(order);
  } catch (error) {
    if (error instanceof Error && error.message === "Not found") {
      return res.status(404).json({
        code: 404,
        message: "Заявка не найдена",
      });
    }
    res.status(500).json({
      code: 500,
      message: "Ошибка загрузки заявки",
    });
    next(error);
  }
});

router.patch("/:id", auth(), async (req, res, next) => {
  const id = Number(req.params.id);
  if (isOrderUpdate(req.body) && !isNaN(id)) {
    const { services, date, client, price, wheels } = req.body;
    try {
      let clientId: number | undefined = undefined;
      let carId: number | undefined = undefined;
      if (client) {
        clientId = await updateClient(req.db, client);
        if ((client.carType || client.carNumber) && client.carId) {
          carId = await updateCar(req.db, client);
        }
      }
      let leadTime: number | undefined = undefined;
      let completionTimestamp: string | undefined = undefined;
      let settings: ISettings | undefined = undefined;
      let updatedDate: string | undefined = undefined;
      let oldOrder: IOrder | undefined = undefined;
      if (services || date || wheels) {
        settings = await getSettings(req.db);
        oldOrder = await getOrder(req.db, id);
        updatedDate = date || oldOrder.date;
        let updatedServices: IServices = services || oldOrder.services;
        let updatedWheels = wheels || oldOrder.wheels;
        leadTime = getLeadTime(
          updatedServices,
          updatedWheels.quantity,
          settings.services
        );
        completionTimestamp = date
          ? getCompletionTimestamp(date, leadTime)
          : oldOrder.completion_timestamp;
      }
      await updateOrder(
        req.db,
        id,
        services,
        date,
        price,
        wheels,
        completionTimestamp,
        leadTime,
        client?.carType
      );

      if (updatedDate && settings && completionTimestamp && oldOrder) {
        const dayStart = new Date(updatedDate);
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
        const passed = checkCorrectOrderInsert(
          orders,
          updatedDate,
          settings.services
        );
        if (!passed) {
          await updateOrder(
            req.db,
            id,
            oldOrder.services,
            oldOrder.date,
            oldOrder.price,
            oldOrder.wheels,
            oldOrder.completion_timestamp,
            oldOrder.lead_time,
            oldOrder.client.carType
          );
          const dayStart = new Date(oldOrder.date);
          dayStart.setHours(
            settings.work_time.from.hours,
            settings.work_time.from.minutes,
            0,
            0
          );
          const orders = await getOrdersSliceForCheck(
            req.db,
            dayStart.toISOString(),
            oldOrder.completion_timestamp,
            oldOrder.date
          );
          const passed = checkCorrectOrderInsert(
            orders,
            oldOrder.date,
            settings.services
          );
          if (!passed) {
            res.status(406).json({
              code: 4060,
              message:
                "Пока меняли данные кто-то уже успел записаться на прежнее время. Создайте новую запись.",
            });
            return await deleteOrder(req.db, id);
          } else {
            return res.status(406).json({
              code: 406,
              message:
                "С такими условиями вы не можете выбрать это время. Попробуйте выбрать другое.",
            });
          }
        }
      }
      return res.status(200).json({
        id,
        clientId,
        carId,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "NotFound") {
          return res.status(404).json({
            code: 404,
            message: "Заявка не найдена.",
          });
        } else if (error.message === "NoData") {
          return res.status(400).json({
            code: 400,
            message: "Не переданы данные для обновления заявки.",
          });
        }
      }
      res.status(500).json({
        code: 500,
        message: "Ошибка при обновлении заявки.",
      });
      return next(error);
    }
  }
  return res.status(400).json({
    code: 400,
    message: "Запрос содержит некорректную информацию",
  });
});

router.delete("/:id", auth(), async (req, res, next) => {
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
          message: "Заявка не найдена.",
        });
      } else {
        res.status(500).json({
          code: 500,
          message: "Ошибка при удалении заявки",
        });
        return next(error);
      }
    }
  }
  return res.status(400).json({
    code: 400,
    message: "Запрос содержит некорректную информацию.",
  });
});

router.patch("/:id/done", auth(), async (req, res, next) => {
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
          message: "Заказ не найден.",
        });
      } else {
        res.status(500).json({
          code: 500,
          message: "Ошибка при обновлении заказа.",
        });
        return next(error);
      }
    }
  }
  return res.status(400).json({
    code: 400,
    message: "Запрос содержит некорректную информацию.",
  });
});

export default router;
