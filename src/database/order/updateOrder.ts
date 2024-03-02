import { Pool } from "pg";
import { SERVICES } from "config/constants";
import { ITimestamp } from "types/ITimestamp";
import { IServices } from "types/IServices";
import { IServicesSettings } from "types/IServicesSettings";
import { IWheels } from "types/IWheels";

export async function updateOrder(
  db: Pool,
  id: number,
  services?: IServices,
  date?: ITimestamp,
  price?: number,
  wheels?: IWheels,
  completionTimestamp?: string,
  leadTime?: number,
  carType?: string
) {
  const columns = [];
  const values = [];

  if (services) {
    const disabledServices: string[] = [];
    const enabledServices: string[] = [];
    SERVICES.forEach((v, k) => {
      if (services.includes(k as keyof IServicesSettings)) {
        enabledServices.push(v);
      } else disabledServices.push(v);
    });
    columns.push(...enabledServices, ...disabledServices);
    values.push(
      ...enabledServices.map(() => "TRUE"),
      ...disabledServices.map(() => "FALSE")
    );
  }

  if (date) {
    columns.push("order_timestamp");
    values.push(new Date(date).toISOString());
  }

  if (price) {
    columns.push("price");
    values.push(price);
  }

  if (wheels) {
    columns.push("quantity", "radius");
    values.push(wheels.quantity, wheels.radius);
  }

  if (completionTimestamp) {
    columns.push("completion_timestamp");
    values.push(completionTimestamp);
  }

  if (leadTime) {
    columns.push("lead_time");
    values.push(leadTime);
  }

  if (carType) {
    columns.push("car_type");
    values.push(carType);
  }

  if (columns.length) {
    const res = await db.query<{ id: number }>(
      `
    UPDATE orders
    SET ${columns.map((c, i) => `${c.toString()}=$${i + 1}`).join(", ")}
    WHERE id=$${values.length + 1}
    RETURNING id
  `,
      [...values, id]
    );
    if (!res.rows[0]) throw new Error("NotFound");
    return res.rows[0].id;
  }
  throw new Error("NoData");
}
