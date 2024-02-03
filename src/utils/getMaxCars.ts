import { IServices } from "src/types/IServices";
import {
  IServiceDefaultSettings,
  IServicesSettings,
} from "src/types/IServicesSettings";

export function getMaxCars(
  services: IServices,
  servicesSettings: IServicesSettings
) {
  let result = Infinity;
  for (const service of services) {
    const { maxCars } = servicesSettings[service] as IServiceDefaultSettings;
    if (typeof maxCars === "number" && result > maxCars) {
      result = maxCars;
    }
  }
  return result;
}
