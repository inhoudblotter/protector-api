import { Client } from "pg";
import { IOrderResponse } from "types/IOrderResponse";
import { formatOrder } from "utils/formatOrder";

export async function getOrdersByDate(db: Client, date: string) {
  const res = await db.query<IOrderResponse>(
    `
    SELECT o.id as order_id, clients.id as client_id, * FROM (
      SELECT * FROM orders
      WHERE order_timestamp::date=$1
      ORDER BY order_timestamp desc
    ) as o
    LEFT JOIN cars ON o.car_id = cars.id
    LEFT JOIN clients ON o.client_id = clients.id;

  `,
    [date]
  );
  return {
    data: res.rows.map((r) => formatOrder(r)),
    totalCount: res.rowCount,
  };
}
