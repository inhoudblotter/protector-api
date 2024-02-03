import { SERVICES } from "src/config/constants";
import { IServices } from "../IServices";

export function isServices(services: unknown): services is IServices {
  if (!Array.isArray(services)) return false;
  for (let s of services) {
    if (!SERVICES.has(s)) return false;
  }
  return true;
}
