import { RADEUS, SERVICES } from "config/constants";
import {
  IServiceDefaultSettings,
  IServiceMinMaxSettings,
  IServicesSettings,
} from "../IServicesSettings";

function isPrices(obj: unknown): obj is { [radius: number]: number } {
  if (
    !obj ||
    typeof obj !== "object" ||
    Object.keys(obj).length !== RADEUS.length
  )
    return false;

  for (const radius of RADEUS) {
    const price = obj[radius as keyof typeof obj];
    if (!price || typeof price !== "number" || price < 0) return false;
  }
  return true;
}

function isMinMaxPrices(
  obj: unknown
): obj is { [radius: number]: { min: number; max: number } } {
  if (
    !obj ||
    typeof obj !== "object" ||
    Object.keys(obj).length !== RADEUS.length
  )
    return false;
  for (const radius of RADEUS) {
    const prices = obj[radius as keyof typeof obj] as {
      min: number;
      max: number;
    };
    if (
      !prices ||
      typeof prices !== "object" ||
      Object.keys(prices).length !== 2
    )
      return false;
    const { min, max } = prices;
    if (
      typeof min !== "number" ||
      typeof max !== "number" ||
      min < 0 ||
      max < min
    )
      return false;
  }
  return true;
}

export function isServiceSettings<T>(
  obj: unknown,
  type: "default" | "min-max" = "default"
): obj is T {
  if (!obj || typeof obj !== "object" || Object.keys(obj).length !== 3)
    return false;

  const { maxCars, leadTime, prices } = obj as IServiceDefaultSettings;
  if (typeof maxCars !== "number" || typeof leadTime !== "number") return false;

  if (!prices || typeof prices !== "object" || Object.keys(prices).length !== 2)
    return false;

  const { suv, passengerCar } = prices;
  if (type === "default") {
    if (!isPrices(suv) || !isPrices(passengerCar)) return false;
  } else if (type === "min-max") {
    if (!isMinMaxPrices(suv) || !isMinMaxPrices(passengerCar)) return false;
  }

  return true;
}

export function isServicesSettings(obj: unknown): obj is IServicesSettings {
  if (!obj || typeof obj !== "object") return false;
  const settings = obj as IServicesSettings;

  for (const key of Object.keys(settings)) {
    if (!SERVICES.has(key)) return false;
    if (!["storage", "addSpikes"].includes(key)) {
      if (
        !isServiceSettings<IServiceDefaultSettings>(
          settings[key as keyof typeof settings]
        )
      )
        return false;
    }
    if (["addSpikes"].includes(key)) {
      if (
        !isServiceSettings<IServiceMinMaxSettings>(
          settings[key as keyof typeof settings],
          "min-max"
        )
      )
        return false;
    }
    if (["storage"].includes(key)) {
      const service = settings[key as keyof typeof settings];
      if (
        !service ||
        typeof service !== "object" ||
        Object.keys(service).length !== 2
      )
        return false;
      const { maxWheels, prices } = service as {
        maxWheels: number;
        prices: { [radius: number]: number };
      };
      if (!maxWheels || typeof maxWheels !== "number") return false;
      if (!isPrices(prices)) return false;
    }
  }
  return true;
}
