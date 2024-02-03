import { ICarType } from "./ICarType";

export interface IClient {
  name: string;
  phone: string;
  carNumber?: string | null;
  carType?: ICarType;
}
