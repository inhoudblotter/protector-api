import { Pool } from "pg";
import { IOrderResponse } from "types/IOrderResponse";
import { formatOrder } from "utils/formatOrder";

export async function getOrdersSlice(db: Pool, start: string, end: string) {
  const res = await db.query<IOrderResponse>(
    `
  SELECT o.id as order_id, clients.id as client_id, * FROM (
    SELECT * FROM orders
    WHERE order_timestamp >= $1 and order_timestamp <= $2
    ORDER BY order_timestamp desc
  ) as o
  LEFT JOIN cars ON o.car_id = cars.id
  LEFT JOIN clients ON o.client_id = clients.id;
  `,
    [start, end]
  );
  return res.rows.map((r) => formatOrder(r));
}
