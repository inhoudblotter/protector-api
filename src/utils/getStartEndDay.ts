import { IWorkTime } from "types/IWorkTime";

export function getStartEndDay(date: string, workTime: IWorkTime) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  let today = new Date();
  today.setHours(0, 0, 0, 0);
  let start, end;
  if (d.getTime() === today.getTime()) {
    today = new Date();
    let m = today.getMinutes();
    m = Math.ceil(m / 15) * 15;
    today.setMinutes(m);
    start = today.toISOString();
  } else {
    d.setHours(workTime.from.hours, workTime.from.minutes, 0, 0);
    start = new Date(d).toISOString();
  }
  d.setHours(workTime.to.hours, workTime.to.minutes, 0, 0);
  end = d.toISOString();
  return { start, end };
}
