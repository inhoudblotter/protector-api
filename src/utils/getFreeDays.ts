import { IWorkTime } from "types/IWorkTime";
import { IServicesSettings } from "types/IServicesSettings";
import { getMaxCars } from "./getMaxCars";
import { roundDate } from "./roundDate";

function hasFreeTime(
  today: boolean,
  date: Date,
  orders: {
    date: string;
    services: (keyof IServicesSettings)[];
    completion_timestamp: string;
  }[],
  leadTime: number,
  workTime: IWorkTime,
  servicesSettings: IServicesSettings
) {
  let datePointer = new Date(date);

  let temp = new Date(date);
  temp.setHours(workTime.to.hours, workTime.to.minutes, 0, 0);
  const breakEnd = temp.getTime() - leadTime * 60 * 1000;

  temp = new Date();
  let m = temp.getMinutes();
  m = Math.ceil(m / 15) * 15;
  temp.setMinutes(m);
  // Если выбран сегодняшний день и уже не получится записаться, то возвращаем false
  if (today && temp.getTime() >= breakEnd) {
    return false;
    // Если выбран сегодняшний день и рабочий день уже начался, то двигаем указатель на текущее время
  } else if (
    today &&
    (temp.getHours() > workTime.from.hours ||
      (temp.getHours() === workTime.from.hours &&
        temp.getMinutes() > workTime.from.minutes))
  ) {
    datePointer = new Date(temp);
    // Иначе устанавливаем указатель на начало дня
  } else datePointer.setHours(workTime.from.hours, workTime.from.minutes);

  let ordersPointer = 0;
  let order = orders[ordersPointer];
  let orderDate = order ? new Date(order.date).getTime() : -Infinity;
  let maxCars = Infinity;
  let freeTime = 0;
  let atWork: { completion_time: number; maxCars: number }[] = [];
  // Двигаем указатель пока не достигнем конца рабочего дня (с учётом времени выполнения заказа)
  while (datePointer.getTime() <= breakEnd) {
    // Очищаем машины, которые завершили выполнение заказа
    const atWorkLength = atWork.length;
    atWork = atWork.filter((el) => el.completion_time > datePointer.getTime());
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
    while (datePointer.getTime() === orderDate) {
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
      // Двигаем записи дальше вместе с указателем
      if (ordersPointer < orders.length - 1) {
        order = orders[++ordersPointer];
        orderDate = new Date(order.date).getTime();
      } else orderDate = Infinity;
    }
    // Если в гараже ещё остались места и свободное время больше или равно времени выполнения заказа,
    // то это означает, что в этот день можно засаться
    if (atWork.length < maxCars && freeTime >= leadTime) return true;
    // Если нет, то двигаемся дальше
    datePointer.setMinutes(datePointer.getMinutes() + 15);
  }
  return false;
}

export function getFreeDays(
  start: string,
  end: string,
  orders: {
    date: string;
    services: (keyof IServicesSettings)[];
    completion_timestamp: string;
  }[],
  leadTime: number,
  workTime: IWorkTime,
  servicesSettings: IServicesSettings
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const datePointer = roundDate(new Date(start));
  let timePointer = datePointer.getTime();
  const temp = roundDate(new Date(end));
  let breakEnd = today.getTime();

  const dates: {
    date: number;
    iso: string;
    free: boolean;
    disabled: boolean;
  }[] = [];
  let ordersPointer = 0;
  // Даты до сегодняшнего дня не могут быть выбраны
  while (timePointer < breakEnd) {
    dates.push({
      date: datePointer.getDate(),
      iso: datePointer.toISOString(),
      free: false,
      disabled: true,
    });
    datePointer.setDate(datePointer.getDate() + 1);
    timePointer = datePointer.getTime();
  }

  //TODO Добавить закрытый день, если дата равна сегодняшней и нет времени для записи

  // Обрезаем начало записей до сегодня
  while (
    orders.length > ordersPointer &&
    roundDate(new Date(orders[ordersPointer].date)).getTime() < timePointer
  ) {
    ++ordersPointer;
  }

  breakEnd = temp.getTime();
  while (timePointer <= breakEnd) {
    // определяем конец отрезка в массиве с записями
    let ordersEnd = ordersPointer;
    while (
      orders.length > ordersEnd &&
      roundDate(new Date(orders[ordersEnd].date)).getTime() < timePointer
    ) {
      ++ordersEnd;
    }
    // Добавляем дату
    dates.push({
      date: datePointer.getDate(),
      iso: datePointer.toISOString(),
      free: hasFreeTime(
        timePointer === today.getTime(),
        datePointer,
        orders.slice(ordersPointer, ordersEnd),
        leadTime,
        workTime,
        servicesSettings
      ),
      disabled: false,
    });
    // двигаем указатели
    datePointer.setDate(datePointer.getDate() + 1);
    timePointer = datePointer.getTime();
  }
  return dates;
}
