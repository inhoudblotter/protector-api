import { Client } from "pg";

export async function deleteSession(db: Client, token: string) {
  const res = await db.query<{ id: string }>(
    `
    DELETE FROM sessions
    WHERE id=$1
    RETURNING id
  `,
    [token]
  );
  if (!res.rowCount) throw new Error("NotFound");
  return res.rows[0].id;
}
