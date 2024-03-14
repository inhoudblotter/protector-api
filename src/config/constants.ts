import { IServicesSettings } from "types/IServicesSettings";

export const SERVICES = new Map<keyof IServicesSettings, string>([
  ["complex", "complex"],
  ["dismantling", "dismantling"],
  ["instalation", "instalation"],
  ["balancing", "balancing"],
  ["removalAndInstalation", "removal_and_instalation"],
  ["storage", "storage"],
  ["addSpikes", "add_spikes"],
  ["cut", "cut"],
  ["puncture", "puncture"],
]);

export const SERVICES_NAMES = new Map([
  ["complex", "комплекс"],
  ["dismantling", "демонтаж"],
  ["instalation", "монтаж"],
  ["balancing", "балансировка"],
  ["removalAndInstalation", "снятие и установка"],
  ["storage", "хранение"],
  ["addSpikes", "дошиповка"],
  ["cut", "ремонт пореза"],
  ["puncture", "ремонт прокола"],
]);

export const CLIENT_FIELDS = new Map([
  ["id", "id"],
  ["name", "username"],
  ["phone", "phone"],
  ["carId", "car_id"],
  ["carNumber", "car_number"],
  ["carType", "car_type"],
]);

export const CAR_TYPES = new Map([
  ["passengerCar", true],
  ["suv", true],
  ["crossover", true],
]);

export const CAR_TYPES_NAMES = new Map([
  ["passengerCar", "легковой"],
  ["suv", "внедорожник"],
  ["crossover", "коссовер"],
]);

export const SESSION_COOKIE = {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
};

export const FILTERS = new Map([
  ["name", "username"],
  ["phone", "phone"],
  ["services", "services"],
  ["carNumber", "car_number"],
]);

export const SORT_COLUMNS = new Map([
  ["orderCreated", "creation_timestamp"],
  ["orderDate", "order_timestamp"],
]);

export const SORT_DIRECTION = new Map([
  ["desc", "DESC"],
  ["asc", "ASC"],
]);

export const RADEUS = [...new Array(10)].map((_, i) => i + 12);
