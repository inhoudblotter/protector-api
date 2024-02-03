export function isToken(str: unknown): str is string {
  if (typeof str !== "string" || str.length !== 64) return false;
  return true;
}
