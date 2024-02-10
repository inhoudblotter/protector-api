import { Client } from "pg";
import { IClientUpdate } from "types/IClientUpdate";

export async function updateCar(db: Client, client: IClientUpdate) {
  if (!client.carId || (!client.carType && !client.carNumber))
    throw new Error("No data");
  const columns = [];
  const values = [];
  if (client.carType) {
    columns.push("car_type");
    values.push(client.carType);
  }
  if (client.carNumber) {
    columns.push("car_number");
    values.push(client.carNumber);
  }
  values.push(client.carId);

  const res = await db.query(
    `
  UPDATE cars
  SET ${columns.map((v, i) => v + `=$${i + 1}`).join(",")}
  WHERE cars.id=$${values.length};
  `,
    values
  );

  if (!res.rowCount) throw new Error("Not found");
  return res.rows[0];
}
