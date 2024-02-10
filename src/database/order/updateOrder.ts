import { Client } from "pg";
import { SERVICES } from "config/constants";
import { ITimestamp } from "types/ITimestamp";
import { IServices } from "types/IServices";
import { IServicesSettings } from "types/IServicesSettings";

export async function updateOrder(
  db: Client,
  id: number,
  services?: IServices,
  date?: ITimestamp,
  price?: number
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
    if (!res.rows.length) throw new Error("NotFound");
    return res.rows[0].id;
  }
}
