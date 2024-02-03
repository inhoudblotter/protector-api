import { Client } from "pg";
import { IUser } from "src/types/IUser";

export async function getUser(db: Client, user: IUser) {
  const res = await db.query<{ id: number; pass: string }>(
    `
    SELECT id, pass FROM users
    WHERE username=$1
  `,
    [user.username]
  );
  return res.rows[0];
}
