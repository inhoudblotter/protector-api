import { Pool } from "pg";

export async function deleteOrder(db: Pool, id: number) {
  const res = await db.query<{ id: number }>(
    `
  DELETE FROM orders
  WHERE id=$1
  RETURNING id;
  `,
    [id]
  );
  if (!res.rowCount) throw new Error("Not Found");
  return res.rows[0].id;
}
