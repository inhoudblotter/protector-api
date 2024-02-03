import { createHash } from "crypto";
import "dotenv/config";

export function getHash(str: string) {
  const hash = createHash("sha256");
  hash.update(process.env.SALT || "abc");
  hash.update(str);
  const digest = hash.digest();
  return digest.toString("hex");
}
