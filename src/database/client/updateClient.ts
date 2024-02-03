import { Client } from "pg";
import { IClientUpdate } from "src/types/IClientUpdate";

export async function updateClient(db: Client, client: IClientUpdate) {
  const res = await db.query<{ id: number }>(
    `
    UPDATE clients
    SET username=$1, phone=$2
    WHERE id=$3
    RETURNING id;
  `,
    [client.name, client.phone, client.id]
  );
  if (!res.rowCount) throw new Error("NotFound");
  return res.rows[0].id;
}
