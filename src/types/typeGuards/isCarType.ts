import { CAR_TYPES } from "src/config/constants";
import { ICarType } from "../ICarType";

export function isCarType(carType: unknown): carType is ICarType {
  if (typeof carType === "string" && CAR_TYPES.has(carType)) return true;
  return false;
}
