import { Client } from "pg";
import { getToken } from "src/utils/getToken";

export async function addToken(db: Client, salt = Math.random() * 31321464) {
  const token = getToken(new Date().getTime().toString(32), salt);
  const res = await db.query<{ token: number }>(
    `
    INSERT INTO register_tokens (token)
    VALUES ($1)
    ON CONFLICT DO NOTHING
    RETURNING token;
  `,
    [token]
  );
  if (!res.rows[0]) return addToken(db);
  return res.rows[0].token;
}
