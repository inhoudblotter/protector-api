import { FILTERS, SERVICES } from "config/constants";

export function getFilters(query: { [key: string]: any }) {
  const result: { [key: string]: any } = {};
  FILTERS.forEach((v, k) => {
    if (query[k]) {
      if (k === "services") {
        const services: string[] = [];
        const searchServices = query[k].split(",");
        if (searchServices.length) {
          searchServices.forEach((s: string) => {
            const service = SERVICES.get(s);
            if (service) services.push(service);
          });
        }
        result[v] = services;
      } else result[v] = query[k];
    }
  });
  return result;
}
