import { Router } from "express";
import { isToken } from "types/typeGuards/isToken";
import { botSendMessage } from "utils/botSendMessage";
import { isToken as isRegisterToken } from "database/registerTokens/isToken";
import { addSubscriber } from "database/subscribersTelegram/addSubscriber";
import { deleteToken } from "database/registerTokens/deleteToken";

const router = Router();

router.post("/", async (req, _, next) => {
  const { message } = req.body;
  const username = message.from.username;
  const chat_id = Number(message.from.chat.id);
  const token = message.text;
  if (typeof username !== "string" || isNaN(chat_id)) {
    return next(
      new Error(`Unknown telegram scheme:\n ${JSON.stringify(req.body)}`)
    );
  }
  if (isToken(token)) {
    const passed = await isRegisterToken(req.db, token);
    if (passed) {
      try {
        await addSubscriber(req.db, chat_id, username);
      } catch (error) {
        if (error instanceof Error && error.message === "AlreadyExists") {
          botSendMessage(chat_id, "Вы уже подписаны на рассылку.");
        }
      }
      await deleteToken(req.db, token);
    }
  }
  return botSendMessage(chat_id, "Неизвестная команда.");
});

export default router;
