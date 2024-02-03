import { ITime, IWorkTime } from "../IWorkTime";
import { isObject } from "./isObject";

function isTime(obj: unknown): obj is ITime {
  if (!isObject(obj)) return false;
  const { hours, minutes } = obj as ITime;
  if (typeof hours !== "number" || typeof minutes !== "number") return false;
  return true;
}

export function isWorkTime(obj: unknown): obj is IWorkTime {
  if (!isObject(obj)) return false;
  const { from, to } = obj as IWorkTime;
  if (!isTime(from) || !isTime(to)) return false;
  return true;
}
