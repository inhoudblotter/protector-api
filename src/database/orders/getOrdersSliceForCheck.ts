import { Client } from "pg";
import { SERVICES } from "src/config/constants";
import { IServices } from "src/types/IServices";
import { IServicesSettings } from "src/types/IServicesSettings";

export async function getOrdersSliceForCheck(
  db: Client,
  from: string,
  to: string,
  cut?: string
): Promise<
  {
    date: string;
    services: (keyof IServicesSettings)[];
    completion_timestamp: string;
  }[]
> {
  const values = [from, to];
  if (cut) values.push(cut);
  const res = await db.query<{
    order_timestamp: string;
    completion_timestamp: string;
    complex: boolean;
    dismantling: boolean;
    instalation: boolean;
    balancing: boolean;
    removal_and_instalation: boolean;
    storage: boolean;
    addspikes: boolean;
    cut: boolean;
    puncture: boolean;
  }>(
    `
    SELECT order_timestamp, completion_timestamp, ${[...SERVICES.values()].join(
      ", "
    )} FROM orders
    WHERE order_timestamp >= $1 and order_timestamp <= $2 ${
      cut ? "and completion_timestamp >= $3" : ""
    }
    ORDER BY order_timestamp asc
  `,
    values
  );
  return res.rows.map((order) => {
    const services: IServices = [];
    SERVICES.forEach((c, k) => {
      if (order[c as keyof typeof order])
        services.push(k as keyof IServicesSettings);
    });
    return {
      date: order.order_timestamp,
      completion_timestamp: order.completion_timestamp,
      services,
    };
  });
}
