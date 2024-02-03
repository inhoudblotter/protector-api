import { Client } from "pg";
import { IUser } from "src/types/IUser";
import { getHash } from "src/utils/getHash";

export async function addUser(db: Client, user: IUser) {
  const res = await db.query(
    `
    INSERT INTO users (username, pass)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
    RETURNING users.id;
  `,
    [user.username, getHash(user.password)]
  );
  return res.rows[0]?.id;
}
