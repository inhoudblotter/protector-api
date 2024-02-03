import { Client } from "pg";
import { getToken } from "src/utils/getToken";

export async function updateSession(
  db: Client,
  userId: number,
  token: string,
  salt = Math.random() * 31321464
) {
  const newToken = getToken(userId.toString(32), salt);
  const res = await db.query<{ id: string }>(
    `
  UPDATE sessions
  SET id=$1, creation_timestamp=$2
  WHERE user_id=$3 AND id=$4
  RETURNING id;
  `,
    [newToken, new Date().toISOString(), userId, token]
  );
  if (!res.rowCount) return token;
  return newToken;
}
