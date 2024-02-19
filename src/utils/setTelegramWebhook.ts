import "dotenv/config";

export async function setTelegramWebhook(url: string) {
  try {
    await fetch(
      `${process.env.TELEGRAM_API}/setWebhook?url=${url}&drop_pending_updates=true`
    );
  } catch (error) {
    console.error();
  }
}
