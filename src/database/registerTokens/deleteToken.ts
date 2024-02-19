import { Pool } from "pg";

export async function deleteToken(db: Pool, token: string) {
  const res = await db.query<{ token: string }>(
    `
  DELETE FROM register_tokens WHERE token=$1 RETURNING token;
  `,
    [token]
  );
  if (!res.rows[0]) throw new Error("NotFound");
  return res.rows[0].token;
}
