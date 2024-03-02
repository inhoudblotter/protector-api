import { Pool } from "pg";
import { getRowsCount } from "../queries";
import { IOrderResponse } from "types/IOrderResponse";
import { IFilters } from "types/IFilters";
import { ISortSetting } from "types/ISortSettings";
import { formatOrder } from "utils/formatOrder";

export async function getOrders(
  db: Pool,
  limit: number = 12,
  offset: number = 0,
  filters?: Partial<IFilters>,
  sortSettings?: Partial<ISortSetting>,
  old: boolean = false
) {
  const table = old ? "done_orders" : "orders";
  let res, totalCount;
  const column = sortSettings?.column
    ? sortSettings.column
    : "creation_timestamp";
  const direction = sortSettings?.direction ? sortSettings.direction : "DESC";

  const values: (string | number)[] = [];
  if (filters && Object.keys(filters).length) {
    let orderFilters = "";
    let temp = [];
    if (filters.services) {
      temp.push(filters.services.map((el) => `${el}=TRUE`).join(" OR "));
    }

    if (temp.length) orderFilters = `WHERE ${temp.join(" AND ")}`;

    let clientsFilter = "";
    temp = [];

    if (filters.username) {
      values.push(`%${filters.username.toLocaleLowerCase()}%`);
      temp.push(`LOWER(clients.username) LIKE $${values.length}`);
    }
    if (filters.phone) {
      values.push(`%${filters.phone.toLocaleLowerCase()}%`);
      temp.push(`LOWER(clients.phone) LIKE $${values.length}`);
    }

    if (filters.car_number) {
      values.push(`%${filters.car_number.toLocaleLowerCase()}%`);
      temp.push(`LOWER(cars.car_number) LIKE $${values.length}`);
    }

    if (temp.length) clientsFilter = `WHERE ${temp.join(" AND ")}`;

    res = await db.query(
      `
    SELECT o.id as order_id, clients.id as client_id, * FROM (
      SELECT * FROM ${table}
      ${orderFilters}
      ORDER BY ${column} ${direction}
    ) o
    LEFT JOIN clients ON o.client_id = clients.id
    LEFT JOIN cars ON o.car_id = cars.id
    ${clientsFilter}
    ORDER BY o.${column} ${direction}
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `,
      [...values, limit, offset]
    );
    totalCount = await db.query(
      `
    SELECT COUNT(*) as total_count FROM ${
      orderFilters ? `(SELECT * FROM ${table} ${orderFilters})` : table
    } o
    ${
      clientsFilter
        ? `
        LEFT JOIN clients ON o.client_id = clients.id
        LEFT JOIN cars ON o.car_id = cars.id
        ${clientsFilter}
        `
        : ""
    }
    `,
      values
    );
  } else {
    res = await db.query<IOrderResponse>(
      `
      SELECT o.id as order_id, clients.id as client_id, * FROM (
        SELECT * FROM ${table}
        ORDER BY ${column} ${direction}
        LIMIT $1 OFFSET $2
      ) o
      LEFT JOIN clients ON o.client_id = clients.id
      LEFT JOIN cars ON o.car_id = cars.id
      ORDER BY o.${column} ${direction}
      `,
      [limit, offset]
    );
    totalCount = await db.query<{ total_count: string }>(getRowsCount(table));
  }

  return {
    data: res.rows.map((r) => formatOrder(r)),
    offset,
    totalCount: Number(totalCount.rows[0].total_count),
  };
}
