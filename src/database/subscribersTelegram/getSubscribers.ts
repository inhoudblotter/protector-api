import { Pool } from "pg";

export async function getSubscribers(db: Pool) {
  const res = await db.query<{ chat_id: number }>(`
  SELECT chat_id FROM subscribers_telegram;
  `);
  return res.rows;
}
