import { formatRussianDate } from "./helpers";
import { PuppeteerClass } from "./Puppeteer";
import { BotLanguage, MessageCommand } from "./types";
import { Telegraf } from "telegraf";

// polling allows the bot to listen for and receive new messages
export const BOT_TOKEN = process.env.BOT_TOKEN || "";
const bot = new Telegraf(BOT_TOKEN);
const timer = 1 * 60000; // 1 minute
const channelId = -1002104374671;
const userChatIds = [336972408, 5441646038];
let language = BotLanguage.Polska;
let intervalId: NodeJS.Timeout | undefined = setInterval(
  checkUpdatesAutomatically,
  timer
);

bot.start((ctx) => {
  ctx.reply("Bot started.");
  console.log("New user started bot:", ctx.chat);
  if (!userChatIds.includes(ctx.chat.id)) {
    userChatIds.push(ctx.chat.id);
  }
});
bot.hears(MessageCommand.Restart, () => {
  intervalId = setInterval(checkUpdatesAutomatically, timer);
});
bot.hears(MessageCommand.Stop, () => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
bot.hears(MessageCommand.CheckManually, async (ctx) => {
  const puppy = new PuppeteerClass();
  const availableDays = await puppy.visitAndIntercept();
  console.log(`${MessageCommand.CheckManually} availableDays`, availableDays);
  if (availableDays.length > 0) {
    availableDays.forEach((day) => {
      broadCast(`Доступна запись на ${formatRussianDate(day)}`, [ctx.chat.id]);
    });
  } else {
    broadCast("Пусто", [ctx.chat.id]);
  }
});
bot.hears(MessageCommand.Ping, (ctx) => {
  broadCast('pong', [channelId])
})
function checkUpdatesAutomatically() {
  const puppy = new PuppeteerClass();
  puppy
    .visitAndIntercept()
    .then((availableDays) => {
      console.log("/try function availableDays", availableDays);
      availableDays.forEach((day) => {
        broadCast(formatRussianDate(day), [channelId]);
      });
    })
    .catch((error) => {
      console.error("Error in update:", error);
      broadCast(`Error: ${error.message}`);
    });
}

// Run the code every 5 minutes (300,000 milliseconds)
function broadCast(message = "привет", users = [channelId]) {
  users.forEach((chatId) => {
    bot.telegram.sendMessage(chatId, message);
  });
}

// Start the bot using polling
bot.launch().then(() => {
  console.log("Bot is running with polling");
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));