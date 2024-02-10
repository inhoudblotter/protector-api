import { CLIENT_FIELDS } from "config/constants";
import { IClientUpdate } from "../IClientUpdate";
import { isCarUpdate } from "./isCarUpdate";

export function isClientUpdate(client: unknown): client is IClientUpdate {
  if (client && typeof client === "object") {
    for (const k of Object.keys(client)) {
      if (!CLIENT_FIELDS.has(k)) {
        return false;
      }
    }
    const { name, phone, carNumber, carType, carId } = client as IClientUpdate;
    if (
      [name, phone, carNumber].some((i) => !!i) &&
      (!name || typeof name === "string") &&
      (!phone || typeof phone === "string") &&
      isCarUpdate(carType, carNumber, carId)
    )
      return true;
  }
  return false;
}
