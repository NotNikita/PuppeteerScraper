import { formatRussianDate } from "./helpers";
import { PuppeteerClass } from "./Puppeteer";
import { BotLanguage, MessageCommand, Operation } from "./types";
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
  ctx.reply("Bot started. Choose an action:", {
    ...keyboards.start_menu,
  });
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

// ------------ LANGUAGE MENU ----------------
bot.hears(MessageCommand.Jezyk, (ctx) => {
  ctx.reply("Obsługiwane języki:", keyboards.languages);
});
bot.action(BotLanguage.Polska, (ctx) => {
  language = BotLanguage.Polska;
  ctx.reply("język zmieniony");
});
bot.action(BotLanguage.Russian, (ctx) => {
  language = BotLanguage.Russian;
  ctx.reply("язык изменен");
});
bot.action(BotLanguage.English, (ctx) => {
  language = BotLanguage.English;
  ctx.reply("language changed");
});

// Start the bot using polling
bot.launch().then(() => {
  console.log("Bot is running with polling");
});

const keyboards = {
  start_menu: {
    reply_markup: {
      keyboard: [],
    },
  },
  operations: {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: Operation.ObywatelstwoPolskie,
            callback_data: Operation.ObywatelstwoPolskie,
          },
        ],
        [
          {
            text: Operation.OdbiorKartyPobytu,
            callback_data: Operation.OdbiorKartyPobytu,
          },
        ],
        [
          {
            text: Operation.OdbiorPaszportu,
            callback_data: Operation.OdbiorPaszportu,
          },
        ],
        [
          {
            text: Operation.SkladanieWnioskow,
            callback_data: Operation.SkladanieWnioskow,
          },
        ],
        [
          {
            text: Operation.UzeskanieStempla,
            callback_data: Operation.UzeskanieStempla,
          },
        ],
        [
          {
            text: Operation.ZlozenieWniosku,
            callback_data: Operation.ZlozenieWniosku,
          },
        ],
      ],
    },
  },
  languages: {
    reply_markup: {
      inline_keyboard: [
        [{ text: BotLanguage.Polska, callback_data: BotLanguage.Polska }],
        [{ text: BotLanguage.English, callback_data: BotLanguage.English }],
        [{ text: BotLanguage.Russian, callback_data: BotLanguage.Russian }],
      ],
    },
  },
};
