import { Pool } from "pg";
import { IUser } from "types/IUser";

export async function getUser(db: Pool, user: IUser) {
  const res = await db.query<{ id: number; pass: string }>(
    `
    SELECT id, pass FROM users
    WHERE username=$1
  `,
    [user.username]
  );
  return res.rows[0];
}
