import { IWheels } from "../IWheels";

export function isWheels(wheels: unknown): wheels is IWheels {
  if (wheels && typeof wheels === "object" && !Array.isArray(wheels)) {
    const { quantity, radius } = wheels as IWheels;
    if (
      typeof quantity === "number" &&
      quantity > 0 &&
      quantity < 7 &&
      typeof radius === "number" &&
      radius > 12 &&
      radius < 24
    )
      return true;
  }
  return false;
}
