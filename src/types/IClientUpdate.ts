import { IClient } from "./IClient";

export interface IClientUpdate extends Partial<IClient> {
  id: number;
  carId?: number;
}
