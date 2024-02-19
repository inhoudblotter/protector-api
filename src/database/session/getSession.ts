import { Pool } from "pg";

export async function getSession(db: Pool, token: string) {
  const res = await db.query<{ user_id: number; creation_timestamp: string }>(
    `
    SELECT user_id, last_update FROM sessions
    WHERE id=$1
  `,
    [token]
  );
  if (!res.rowCount) throw new Error("NotFound");
  return res.rows[0];
}
