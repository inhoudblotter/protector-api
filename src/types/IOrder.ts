import { IClient } from "./IClient";
import { IServices } from "./IServices";
import { ITimestamp } from "./ITimestamp";
import { IWheels } from "./IWheels";

export interface IOrder {
  services: IServices;
  client: IClient;
  date: ITimestamp;
  completion_timestamp: ITimestamp;
  wheels: IWheels;
  price?: number;
}
