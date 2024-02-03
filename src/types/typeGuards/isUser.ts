import { IUser } from "../IUser";

export function isUser(body: unknown): body is IUser {
  if (body && typeof body === "object" && !Array.isArray(body)) {
    const { username, password } = body as IUser;
    if (
      typeof username === "string" &&
      username.length <= 102 &&
      typeof password === "string" &&
      password.length <= 102
    )
      return true;
  }
  return false;
}
