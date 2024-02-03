import { ISettings } from "../ISettings";
import { isAdddress } from "./isAddress";
import { isServicesSettings } from "./isServicesSettings";
import { isSocials } from "./isSocials";
import { isWorkTime } from "./isWorkTime";

export function isSettings(body: unknown): body is Partial<ISettings> {
  if (!body || typeof body !== "object") return false;
  const { phone, address, services, socials, work_time } = body as ISettings;
  if (phone && (typeof phone !== "string" || phone.length !== 12)) return false;
  if (socials && !isSocials(socials)) return false;
  if (address && !isAdddress(address)) return false;
  if (services && !isServicesSettings(services)) return false;
  if (work_time && !isWorkTime(work_time)) return false;
  return true;
}
