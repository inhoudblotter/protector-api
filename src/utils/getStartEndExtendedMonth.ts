import { IDate } from "types/IDate";

export function getStartEndExtendedMonth(date: IDate) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  let temp = new Date(d);
  let day = d.getDay();
  if (day !== 1) {
    if (day !== 0) {
      temp.setDate(2 - day);
    } else temp.setDate(-5);
  }
  const start = temp.toISOString();
  temp = new Date(d);
  temp.setMonth(temp.getMonth() + 1);
  temp.setDate(0);
  day = temp.getDay();
  if (day !== 1) {
    if (day !== 0) {
      temp.setDate(temp.getDate() + 7 - temp.getDay());
    } else temp.setDate(temp.getDate());
  } else temp.setDate(temp.getDate() + 6);
  const end = temp.toISOString();
  console.log(start, end);
  return { start, end };
}
