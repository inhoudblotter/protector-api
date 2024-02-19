import "dotenv/config";

export async function botSendMessage(chat_id: number, message: string) {
  const res = await fetch(
    `${process.env.TELEGRAM_HOST}/bot${process.env.TELEGRAM_KEY}/sendMessage?chat_id=${chat_id}&parse_mode=html`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      body: message,
    }
  );
  const data = await res.json();
  if (!res.ok && data.description) {
    throw new Error(data.description);
  }
  throw new Error(`Unknown Telegram Error: ${data}`);
}
