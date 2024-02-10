import { IServices } from "types/IServices";
import {
  IServiceDefaultSettings,
  IServicesSettings,
} from "types/IServicesSettings";

export function getLeadTime(
  services: IServices,
  quantityWheels: number,
  servicesSettings: IServicesSettings
) {
  let result = 0;
  for (const service of services) {
    const settings = servicesSettings[service] as IServiceDefaultSettings;
    if (!isNaN(Number(settings.leadTime))) {
      result += settings.leadTime * quantityWheels;
    }
  }
  return result;
}
