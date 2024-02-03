import { Client } from "pg";

export async function getSession(db: Client, token: string) {
  const res = await db.query<{ user_id: number; creation_timestamp: string }>(
    `
    SELECT user_id, creation_timestamp FROM sessions
    WHERE id=$1
  `,
    [token]
  );
  if (!res.rowCount) throw new Error("NotFound");
  return res.rows[0];
}
