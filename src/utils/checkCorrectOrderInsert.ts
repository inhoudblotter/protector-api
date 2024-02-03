import { IServicesSettings } from "src/types/IServicesSettings";
import { getMaxCars } from "./getMaxCars";

export function checkCorrectOrderInsert(
  orders: {
    date: string;
    services: (keyof IServicesSettings)[];
    completion_timestamp: string;
  }[],
  date: string,
  servicesSettings: IServicesSettings
) {
  let atWork: { completion_time: number; maxCars: number }[] = [];
  let maxCars = Infinity;
  const startRange = new Date(date).getTime();
  for (const o of orders) {
    const startTime = new Date(o.date);
    // Очищаем от машин, которые закончили выполнение заказа
    const atWorkLength = atWork.length;

    atWork = atWork.filter((el) => {
      return el.completion_time >= startTime.getTime();
    });
    const atWorkChanged = atWork.length !== atWorkLength;
    // Если изменилось количество машин,
    // то меняем максимальное количество мест на минимальное значение из массива "в работе"
    if (atWorkChanged) {
      if (atWork.length) {
        maxCars = Math.min.apply(
          null,
          atWork.map((el) => el.maxCars)
        );
      } else maxCars = Infinity;
    }
    // Обновляем максимальное количество машин в работе
    const mc = getMaxCars(o.services, servicesSettings);
    if (maxCars > mc) maxCars = mc;
    // Добавляем машину в массив "в работе"
    atWork.push({
      completion_time: new Date(o.completion_timestamp).getTime(),
      maxCars: mc,
    });
    //Если время начала выполнения заказа меньше начала проверяемого отрезка,
    //то количество машин в работе должно быть меньше на 1, чем максимальное количество машин
    if (startTime.getTime() < startRange && atWork.length >= maxCars) {
      return false;
      //Если время начала выполнения заказа больше или равно началу проверяемого отрезка,
      //то количество машин в работе не должно превышать максимальное количество машин
    } else if (startTime.getTime() >= startRange && atWork.length > maxCars) {
      return false;
    }
  }
  //Если не вышли из цыкла, то вставка проведена правильно
  return true;
}
