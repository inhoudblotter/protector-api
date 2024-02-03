import { ISocials } from "../ISocials";
import { isObject } from "./isObject";

export function isSocials(obj: unknown): obj is ISocials {
  if (!isObject(obj)) return false;
  const { telegram, whats_app, viber } = obj as ISocials;
  if (typeof telegram !== "string") return false;
  if (typeof whats_app !== "string") return false;
  if (typeof viber !== "string") return false;
  return true;
}
