import { getHash } from "./getHash";

export function getToken(prefix: string, salt: number = 0) {
  return getHash(prefix + Date.now().toString(32) + salt.toString(32));
}
