import { Client } from "pg";

export async function doneOrder(db: Client, id: number) {
  let res = await db.query(
    `
  DELETE FROM orders
  WHERE id=$1
  RETURNING *;
  `,
    [id]
  );
  if (!res.rowCount) throw new Error("Not Found");
  
  delete res.rows[0].id;
  if (!res.rows[0].order_timestamp) delete res.rows[0].order_timestamp;

  const columns = Object.keys(res.rows[0]);

  res = await db.query<{ id: number }>(
    `
    INSERT INTO done_orders
    (${columns.join(",")})
    VALUES (${columns.map((_, i) => `$${i + 1}`).join(",")})
    RETURNING id;
  `,
    Object.values(res.rows[0])
  );
  if (!res.rowCount) throw new Error("Internal error");
  return res.rows[0].id;
}
