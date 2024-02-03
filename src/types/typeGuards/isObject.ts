export function isObject(obj: unknown): obj is object {
  if (!obj || typeof obj !== "object") return false;
  return true;
}
