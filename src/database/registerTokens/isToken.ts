import { Client } from "pg";

export async function isToken(db: Client, token: string) {
  const res = await db.query(
    `
  SELECT * FROM register_tokens WHERE token=$1 LIMIT 1;
  `,
    [token]
  );
  return !!res.rowCount;
}
