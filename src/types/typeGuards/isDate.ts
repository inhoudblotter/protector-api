import { IDate } from "../IDate";

export function isDate(date: unknown): date is IDate {
  if (typeof date !== "string" || isNaN(new Date(date).getTime())) return false;
  return true;
}
