import { Pool } from "pg";

export async function deleteSubscriber(db: Pool, chat_id: number) {
  const res = await db.query<{ chat_id: number }>(
    `
    DELETE FROM subscribers_telegram WHERE chat_id=$1;
  `,
    [chat_id]
  );
  if (!res.rows[0]) throw new Error("NotFound");
}
