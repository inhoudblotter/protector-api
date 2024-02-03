import { isServices } from "./isServices";
import { IOrderUpdate } from "../IOrderUpdate";
import { isWheels } from "./isWheels";
import { isClientUpdate } from "./isClientUpdate";
import { isDate } from "./isDate";

export function isOrderUpdate(body: unknown): body is IOrderUpdate {
  if (body && typeof body === "object" && !Array.isArray(body)) {
    const order = body as IOrderUpdate;

    if (
      (!order.date || isDate(order.date)) &&
      (!order.services || isServices(order.services)) &&
      (!order.client || isClientUpdate(order.client)) &&
      (!order.date || isDate(order.date)) &&
      (!order.services || isServices(order.services)) &&
      (!order.wheels || isWheels(order.wheels)) &&
      (!order.price || typeof order.price == "number")
    )
      return true;
  }
  return false;
}
