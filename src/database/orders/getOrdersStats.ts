import { Client } from "pg";
import { SERVICES } from "config/constants";
import { IDate } from "types/IDate";
import { IStats } from "types/IStats";

export async function getOrderStats(db: Client, from: IDate, to: IDate) {
  const result: Partial<IStats> = {};
  const columns = [
    "COUNT(id) as number_of_completed_orders",
    "SUM(price) as profit",
  ];
  for (const service of SERVICES.values()) {
    columns.push(`SUM(${service}::int) as ${service}`);
  }
  const generalStatistics = await db.query<{
    number_of_completed_orders: number;
    profit: number;
    complex: number;
    dismantling: number;
    instalation: number;
    balancing: number;
    removal_and_instalation: number;
    storage: number;
    add_spikes: number;
    cut: number;
    puncture: number;
  }>(
    `
    SELECT ${columns.join(", ")}
    FROM done_orders
    WHERE order_timestamp >= $1 and order_timestamp <= $2;
  `,
    [from, to]
  );
  result.numberOfCompletedOrders = Number(
    generalStatistics.rows[0].number_of_completed_orders
  );
  result.profit = Number(generalStatistics.rows[0].profit) || 0;
  result.groupDistribution = [];
  for (const [k, v] of SERVICES.entries()) {
    result.groupDistribution.push({
      label: k,
      value:
        Number(
          generalStatistics.rows[0][
            v as keyof (typeof generalStatistics.rows)[0]
          ]
        ) || 0,
    });
  }
  let workLoad = await db.query<{ hour: string; value: string }>(
    `
    SELECT COUNT(id) as "value", EXTRACT(HOUR FROM order_timestamp) as hour
    FROM done_orders
    WHERE order_timestamp >= $1 and order_timestamp <= $2
    GROUP BY hour
    ORDER BY hour;
  `,
    [from, to]
  );

  result.workLoad = {
    daily: workLoad.rows.map((el) => ({
      hour: Number(el.hour),
      value: Number(el.value),
    })),
  };
  const range =
    (new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24);
  if (range >= 7) {
    let workLoad = await db.query<{ day: string; value: string }>(
      `
      SELECT COUNT(id) as "value", EXTRACT(ISODOW FROM order_timestamp) as day
      FROM done_orders
      WHERE order_timestamp >= $1 and order_timestamp <= $2
      GROUP BY day
      ORDER BY day;
  `,
      [from, to]
    );
    result.workLoad.weekly = workLoad.rows.map((el) => ({
      day: Number(el.value),
      value: Number(el.value),
    }));
  }
  if (range > 31) {
    let workLoad = await db.query<{ month: string; value: string }>(
      `
      SELECT COUNT(id) as "value", EXTRACT(MONTH FROM order_timestamp) as month
      FROM done_orders
      WHERE order_timestamp >= $1 and order_timestamp <= $2
      GROUP BY month
      ORDER BY month;
    `,
      [from, to]
    );
    result.workLoad.annual = workLoad.rows.map((el) => ({
      month: Number(el.value),
      value: Number(el.value),
    }));
  }
  return result as IStats;
}
