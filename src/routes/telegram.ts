import { Router } from "express";
import { isToken } from "types/typeGuards/isToken";
import { botSendMessage } from "utils/botSendMessage";
import { isToken as isRegisterToken } from "database/registerTokens/isToken";
import { addSubscriber } from "database/subscribersTelegram/addSubscriber";
import { deleteToken } from "database/registerTokens/deleteToken";
import { isTelegramUpdate } from "types/ITelegramUpdate";

const router = Router();

router.post("/", async (req, _, next) => {
  if (!isTelegramUpdate(req.body))
    return next(
      new Error(`Unknown telegram scheme:\n ${JSON.stringify(req.body)}`)
    );
  const token = req.body.message.text;
  const chat_id = req.body.message.chat.id;
  const username = req.body.message.chat.username;
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
