import { ICarType } from "../ICarType";
import { isCarType } from "./isCarType";

export function isCarUpdate(
  carType: undefined | ICarType,
  carNumber: undefined | string | null,
  carId: undefined | number
) {
  if (
    ((!carNumber || typeof carNumber === "string" || carNumber === null) &&
      (!carType || isCarType(carType)) &&
      !carId) ||
    typeof carId === "number"
  )
    return true;
  return false;
}
