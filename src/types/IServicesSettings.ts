export interface IServiceDefaultSettings {
  leadTime: number;
  maxCars: number;
  prices: {
    [key in "suv" | "crossover" | "passengerCar"]: { [radius: number]: number };
  };
}

export interface IServiceMinMaxSettings {
  leadTime: number;
  maxCars: number;
  prices: {
    [key in "suv" | "crossover" | "passengerCar"]: {
      [radius: number]: { min: number; max: number };
    };
  };
}

export interface IServicesSettings {
  complex: IServiceDefaultSettings;
  balancing: IServiceDefaultSettings;
  removalAndInstalation: IServiceDefaultSettings;
  dismantling: IServiceDefaultSettings;
  instalation: IServiceDefaultSettings;
  puncture: IServiceDefaultSettings;
  cut: IServiceDefaultSettings;
  addSpikes: IServiceMinMaxSettings;
  storage: {
    maxWheels: number;
    prices: { [radius: number]: number };
  };
}
