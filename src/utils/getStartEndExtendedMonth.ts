import { IDate } from "src/types/IDate";

export function getStartEndExtendedMonth(date: IDate) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  let temp = new Date(d);
  let day = d.getDay();
  if (day !== 1) {
    if (day !== 0) {
      temp.setDate(-day + 1);
    } else temp.setDate(-6);
  }
  const start = temp.toISOString();
  temp = new Date(d);
  temp.setMonth(temp.getMonth() + 1);
  temp.setDate(0);
  day = temp.getDay();
  if (day !== 1) {
    if (day !== 0) {
      temp.setDate(temp.getDate() + 8 - temp.getDay());
    } else temp.setDate(temp.getDate() + 1);
  }
  const end = temp.toISOString();
  return { start, end };
}
