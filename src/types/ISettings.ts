import { IAddress } from "./IAddress";
import { IServicesSettings } from "./IServicesSettings";
import { ISocials } from "./ISocials";
import { IWorkTime } from "./IWorkTime";

export interface ISettings {
  phone: string;
  socials: ISocials;
  address: IAddress;
  work_time: IWorkTime;
  services: IServicesSettings;
}
