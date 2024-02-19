export interface IOrderResponse {
  order_id: number;
  client_id: number;
  car_id: number;
  radius: number;
  quantity: number;
  car_type?: "passengerCar" | "suv";
  order_timestamp: string;
  lead_time: number;
  complex: boolean;
  dismantling: boolean;
  instalation: boolean;
  balancing: boolean;
  removal_and_instalation: boolean;
  storage: boolean;
  addspikes: boolean;
  cut: boolean;
  puncture: boolean;
  creation_timestamp: string;
  completion_timestamp: string;
  username: string;
  phone: string;
  car_number: string;
}
