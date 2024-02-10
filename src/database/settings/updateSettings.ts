import { Client } from "pg";
import { ISettings } from "types/ISettings";

export async function updateSettings(db: Client, settings: Partial<ISettings>) {
  if (settings.phone) {
    const res = await db.query(
      `
    UPDATE settings SET setting_value=$1 WHERE title='phone' RETURNING id
    `,
      [JSON.stringify(settings.phone)]
    );
    if (!res.rowCount) throw new Error("Failed to update phone");
  }
  if (settings.address) {
    const res = await db.query(
      `
    UPDATE settings SET setting_value=$1 WHERE title='point_address' RETURNING id
    `,
      [JSON.stringify(settings.address)]
    );
    if (!res.rowCount) throw new Error("Failed to update address");
  }
  if (settings.services) {
    const res = await db.query(
      `
    UPDATE settings SET setting_value=$1 WHERE title='services' RETURNING id
    `,
      [JSON.stringify(settings.services)]
    );
    if (!res.rowCount) throw new Error("Failed to update services");
  }
  if (settings.work_time) {
    const res = await db.query(
      `
    UPDATE settings SET setting_value=$1 WHERE title='work_time' RETURNING id
    `,
      [JSON.stringify(settings.work_time)]
    );
    if (!res.rowCount) throw new Error("Failed to update work time");
  }
  if (settings.socials) {
    const res = await db.query(
      `
    UPDATE settings SET setting_value=$1 WHERE title='socials' RETURNING id;
    `,
      [JSON.stringify(settings.socials)]
    );
    if (!res.rowCount) throw new Error("Failed to update socials");
  }
  return true;
}
