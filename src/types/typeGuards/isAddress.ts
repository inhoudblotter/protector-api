import { IAddress } from "../IAddress";

export function isAdddress(address: unknown): address is IAddress {
  if (!address || typeof address !== "object") return false;
  const { street, house, latitude, longitude } = address as IAddress;
  if (!street || typeof street !== "string" || street.length > 100)
    return false;
  if (!house || typeof house !== "string" || house.length > 100) return false;
  if (!latitude || typeof latitude !== "number") return false;
  if (!longitude || typeof longitude !== "number") return false;
  return true;
}
