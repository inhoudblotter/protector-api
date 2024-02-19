import { Pool } from "pg";
import { getToken } from "utils/getToken";

export async function addSession(
  db: Pool,
  userId: number,
  salt = Math.random() * 31321464
) {
  const token = getToken(userId.toString(32), salt);
  const res = await db.query<{ id: number }>(
    `
    INSERT INTO sessions (id, user_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
    RETURNING id;
  `,
    [token, userId]
  );
  if (!res.rows.length) return addSession(db, userId);
  return res.rows[0]?.id;
}
