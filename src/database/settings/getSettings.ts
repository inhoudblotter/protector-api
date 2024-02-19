import { Pool } from "pg";
import { ISettings } from "types/ISettings";

export async function getSettings(db: Pool): Promise<ISettings> {
  const settings: Partial<ISettings> = {};
  const res = await db.query<{ title: string; setting_value: any }>(`
  SELECT title, setting_value FROM settings;
  `);
  for (const row of res.rows) {
    if (row.title === "phone") {
      settings.phone = row.setting_value;
    } else if (row.title === "point_address") {
      settings.address = row.setting_value;
    } else if (row.title === "services") {
      settings.services = row.setting_value;
    } else if (row.title === "work_time") {
      settings.work_time = row.setting_value;
    } else if (row.title === "socials") {
      settings.socials = row.setting_value;
    }
  }
  return settings as ISettings;
}
