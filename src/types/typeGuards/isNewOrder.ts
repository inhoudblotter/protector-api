import { IOrder } from "../IOrder";
import { isClient } from "./isClient";
import { isServices } from "./isServices";
import { isWheels } from "./isWheels";
import { isDate } from "./isDate";

export function isNewOrder(body: unknown): body is IOrder {
  if (body && typeof body === "object") {
    const order = body as IOrder;
    if (
      isServices(order.services) &&
      isClient(order.client) &&
      (!order.date || isDate(order.date)) &&
      isWheels(order.wheels)
    )
      return true;
  }
  return false;
}
