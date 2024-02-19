import { Pool } from "pg";

export async function addSubscriber(
  db: Pool,
  chat_id: number,
  username: string
) {
  const res = await db.query<{ chat_id: number }>(
    `
  INSERT INTO subscribers_telegram (chat_id, username)
  VALUES ($1, $2)
  ON CONFLICT (chat_id) DO NOTHING
  RETURNING chat_id;
  `,
    [chat_id, username]
  );
  if (!res.rows[0]) new Error("AlreadyExists");
  return res.rows[0].chat_id;
}
