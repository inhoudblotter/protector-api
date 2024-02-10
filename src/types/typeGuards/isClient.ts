import { CLIENT_FIELDS } from "config/constants";
import { IClient } from "../IClient";
import { isCarType } from "./isCarType";

export function isClient(client: unknown): client is IClient {
  if (client && typeof client === "object") {
    for (const k of Object.keys(client)) {
      if (!CLIENT_FIELDS.has(k)) {
        return false;
      }
    }
    const { name, phone, carNumber, carType } = client as IClient;
    if (
      typeof name === "string" &&
      typeof phone === "string" &&
      (!carNumber || typeof carNumber === "string") &&
      (!carType || isCarType(carType))
    )
      return true;
  }
  return false;
}
