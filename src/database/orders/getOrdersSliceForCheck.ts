import { Pool } from "pg";
import { SERVICES } from "config/constants";
import { IServices } from "types/IServices";
import { IServicesSettings } from "types/IServicesSettings";

export async function getOrdersSliceForCheck(
  db: Pool,
  from: string,
  to: string,
  cut?: string,
  skip?: number
): Promise<
  {
    date: string;
    services: (keyof IServicesSettings)[];
    completion_timestamp: string;
  }[]
> {
  const values: (string | number)[] = [from, to];
  const searchQueries = ["order_timestamp >= $1 and order_timestamp <= $2"];
  if (cut) {
    values.push(cut);
    searchQueries.push(`completion_timestamp >= $${values.length}`);
  }
  if (skip) {
    values.push(skip);
    searchQueries.push(`id != $${values.length}`);
  }
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
    WHERE ${searchQueries.join(" and ")}
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
