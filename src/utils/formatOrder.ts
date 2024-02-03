import { SERVICES } from "src/config/constants";
import { IOrderResponse } from "src/types/IOrderResponse";
import { IServices } from "src/types/IServices";
import { IServicesSettings } from "src/types/IServicesSettings";

export function formatOrder(order: IOrderResponse) {
  const services: IServices = [];
  SERVICES.forEach((c, k) => {
    if (order[c as keyof typeof order])
      services.push(k as keyof IServicesSettings);
  });
  return {
    id: order.order_id,
    client: {
      id: order.client_id,
      name: order.username,
      phone: order.phone,
      carId: order.car_id,
      carNumber: order.car_number,
      carType: order.car_type,
    },
    date: order.order_timestamp,
    completion_timestamp: order.completion_timestamp,
    services,
    wheels: {
      radius: order.radius,
      quantity: order.quantity,
    },
  };
}
