import { Client } from "pg";
import { IClient } from "src/types/IClient";
import { ITimestamp } from "src/types/ITimestamp";
import { IServices } from "src/types/IServices";
import { SERVICES } from "src/config/constants";
import { IWheels } from "src/types/IWheels";

export async function addOrder(
  db: Client,
  client: IClient,
  services: IServices,
  date: ITimestamp,
  wheels: IWheels,
  completionTimestamp: string
) {
  let res;
  res = await db.query<{ id: number }>(
    `
    INSERT INTO clients (username, phone)
    VALUES ($1, $2)
    ON CONFLICT (phone) DO UPDATE SET username=EXCLUDED.username
    RETURNING clients.id;
  `,
    [client.name, client.phone]
  );
  if (!res.rowCount) throw new Error("Failed to insert client");
  const clientId = res.rows[0].id;
  let carId: number | null = null;
  if (client.carNumber) {
    res = await db.query<{ id: number }>(
      `
      SELECT id FROM cars
      WHERE cars.car_number = $1 AND client_id = $2
      LIMIT 1;
    `,
      [client.carNumber, clientId]
    );
    if (!res.rowCount) {
      res = await db.query<{ id: number }>(
        `
        INSERT INTO cars (client_id, car_number)
        VALUES ($1, $2)
        RETURNING cars.id;
      `,
        [clientId, client.carNumber]
      );
    }
    carId = res.rows[0].id;
  }

  res = await db.query<{ id: number }>(
    `
    INSERT INTO orders (client_id, car_id, car_type, radius, quantity, order_timestamp, completion_timestamp, ${services
      .map((s) => SERVICES.get(s))
      .join(", ")})
    VALUES ($1, $2, $3, $4, $5, $6, $7, ${services
      .map(() => "TRUE")
      .join(", ")})
    RETURNING orders.id
  `,
    [
      clientId,
      carId,
      client.carType,
      wheels.radius,
      wheels.quantity,
      new Date(date).toISOString(),
      completionTimestamp,
    ]
  );
  return res.rows[0].id;
}
