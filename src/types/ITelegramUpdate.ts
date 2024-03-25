import { isObject } from "./typeGuards/isObject";

interface ITelegramUpdate {
  // update_id: number;
  message: {
    // message_id: number;
    // from: {
    //   id: number;
    //   is_bot: boolean;
    //   first_name: string;
    //   username: string;
    //   language_code: string;
    // };
    chat: {
      id: number;
      // first_name: string;
      username?: string;
      first_name?: string;
      // type: string;
    };
    // date: number;
    text: string;
  };
}

export function isTelegramUpdate(body: unknown): body is ITelegramUpdate {
  if (!isObject(body)) return false;
  const { message } = body as ITelegramUpdate;
  if (!isObject(message)) return false;
  const { chat, text } = message;
  if (typeof text !== "string") return false;
  if (!isObject(chat)) return false;
  const { id, username, first_name } = chat;
  if (typeof id !== "number") return false;
  if (username && (typeof username !== "string" || username.length > 100))
    return false;
  if (first_name && (typeof first_name !== "string" || first_name.length > 100))
    return false;
  return true;
}
