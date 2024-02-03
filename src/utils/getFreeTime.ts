import { IServicesSettings } from "src/types/IServicesSettings";
import { IWorkTime } from "src/types/IWorkTime";
import { getMaxCars } from "./getMaxCars";

export function getFreeTime(
  date: string,
  orders: {
    date: string;
    services: (keyof IServicesSettings)[];
    completion_timestamp: string;
  }[],
  leadTime: number,
  workTime: IWorkTime,
  servicesSettings: IServicesSettings
) {
  const times: string[][] = [];
  let timePointer = new Date(date);
  timePointer.setHours(0, 0, 0, 0);
  let today = new Date();
  today.setHours(0, 0, 0, 0);

  const temp = new Date(timePointer);
  temp.setHours(workTime.to.hours, workTime.to.minutes);
  const breakEnd = temp.getTime() - leadTime * 60 * 1000;

  if (timePointer.getTime() === today.getTime()) {
    today = new Date();
    let m = today.getMinutes();
    m = Math.ceil(m / 15) * 15;
    today.setMinutes(m);
    // Если выбрана текущая дата и при этом не осталось свободного времени, то возращаем пустой массив.
    if (today.getTime() > breakEnd) {
      return times;
      // Если рабочий день уже начался, то двигаем курсор на текущее время.
    } else if (
      temp.getHours() > workTime.from.hours ||
      (temp.getHours() === workTime.from.hours &&
        temp.getMinutes() > workTime.from.minutes)
    ) {
      timePointer = new Date(today);
      // Иначе устанавливаем на начало рабочего дня.
    } else timePointer.setHours(workTime.from.hours, workTime.from.minutes);
    // Если выбрана другая дата, то устанавливаем его на начало рабочего дня.
  } else timePointer.setHours(workTime.from.hours, workTime.from.minutes);

  let ordersPointer = 0;
  let order = orders[ordersPointer];
  let orderDate = order ? new Date(order.date).getTime() : -Infinity;
  let maxCars = Infinity;
  let freeTime = 0;
  let atWork: { completion_time: number; maxCars: number }[] = [];
  const hoursPointer = { index: -1, hours: Infinity };
  // Двигаем указатель пока не достигнем конца рабочего дня (с учётом времени выполнения заказа)

  while (timePointer.getTime() <= breakEnd) {
    // Очищаем машины, которые завершили выполнение заказа
    const atWorkLength = atWork.length;
    atWork = atWork.filter((el) => el.completion_time > timePointer.getTime());
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
    // Если машин в работа меньше чем максимальное количество машин, то добавляем 15 минут к свободному времени
    if (atWork.length < maxCars) freeTime += 15;
    // Пока время выполнения совпадает со временем указателя идем по массиву записей

    while (timePointer.getTime() === orderDate) {
      // Берём максимальное количество машин для выбранных в записи услуг
      const mc = getMaxCars(order.services, servicesSettings);
      if (maxCars > mc) {
        maxCars = mc;
      }
      // Помещаем машину в массив "в работе"
      atWork.push({
        completion_time: new Date(order.completion_timestamp).getTime(),
        maxCars: mc,
      });
      // Если все места заняты, то устанавливаем счётчик свободного времени на 0
      if (atWork.length >= maxCars) {
        freeTime = 0;
      }
      // Двигаем записи дальше
      if (ordersPointer < orders.length - 1) {
        order = orders[++ordersPointer];
        orderDate = new Date(order.date).getTime();
      } else orderDate = Infinity;
    }
    // Если в гараже ещё остались места и свободное время больше или равно времени выполнения заказа,
    // то это означает, что в этот день можно записаться
    if (atWork.length < maxCars && freeTime >= leadTime) {
      if (timePointer.getHours() !== hoursPointer.hours) {
        times.push([]);
        ++hoursPointer.index;
        hoursPointer.hours = timePointer.getHours();
      }
      times[hoursPointer.index].push(timePointer.toISOString());
    }
    // Если нет, то двигаемся дальше
    timePointer.setMinutes(timePointer.getMinutes() + 15);
  }
  return times;
}
