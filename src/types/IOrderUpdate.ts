import { IClientUpdate } from "./IClientUpdate";
import { IServices } from "./IServices";
import { ITimestamp } from "./ITimestamp";
import { IWheels } from "./IWheels";

export interface IOrderUpdate {
  id: number;
  services?: IServices;
  date?: ITimestamp;
  wheels?: IWheels;
  client?: IClientUpdate;
  price?: number;
}
