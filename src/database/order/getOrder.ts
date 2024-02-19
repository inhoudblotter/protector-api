import { Pool } from "pg";
import { IOrderResponse } from "types/IOrderResponse";
import { formatOrder } from "utils/formatOrder";

export async function getOrder(db: Pool, id: number) {
  const res = await db.query<IOrderResponse>(
    `
    SELECT o.id as order_id, clients.id as client_id, * FROM (
      SELECT * FROM orders
      WHERE id=$1
      LIMIT 1
    ) o
    LEFT JOIN cars ON o.car_id = cars.id
    LEFT JOIN clients ON o.client_id = clients.id;
  `,
    [id]
  );

  if (!res.rowCount) throw new Error("Not found");

  return formatOrder(res.rows[0]);
}
