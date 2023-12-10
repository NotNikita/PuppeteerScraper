import { formatDateTimestampForRequest, formatRussianDate } from "./helpers";
import { PuppeteerClass, siteUrl } from "./Puppeteer";
import { MessageCommand } from "./types";
import { Telegraf } from "telegraf";
import http from "http";
import { AxiosResponse } from "axios";
import { TimeRequest, getAvailableTimeForDay } from "./Puppeteer/axiosRequest";

http
  .createServer((_req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.write("Hello World!");
    res.end();
  })
  .listen(+(process.env.PORT || 4000));

// polling allows the bot to listen for and receive new messages
export const BOT_TOKEN = process.env.BOT_TOKEN || "";
const bot = new Telegraf(BOT_TOKEN);
const timer = 1 * 60000; // 1 minute
const channelId = -1002104374671;
// second is mine
const userChatIds = [336972408, 5441646038];
let intervalId: NodeJS.Timeout | undefined = setInterval(
  checkUpdatesAutomatically,
  timer
);

bot.start((ctx: { reply: (arg0: string) => void; chat: { id: number } }) => {
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
bot.hears(
  MessageCommand.CheckManually,
  async (ctx: { chat: { id: number } }) => {
    const puppy = new PuppeteerClass();
    const { availableDays, captchaToken, bearerToken } =
      await puppy.visitAndIntercept();
    console.log(`${MessageCommand.CheckManually} availableDays`, availableDays);
    if (availableDays?.length > 0) {
      availableDays.forEach((day) => {
        getAvailableTimeForDay(
          siteUrl,
          day,
          captchaToken,
          bearerToken ?? ""
        ).then((response: AxiosResponse<TimeRequest[]>) => {
          console.log(response);
          response.data?.forEach((timeOfDay) =>
            broadCast(
              "Доступна запись на " +
                formatDateTimestampForRequest(timeOfDay.dateTime),
              [ctx.chat.id]
            )
          );
        });
      });
    } else {
      broadCast("Пусто", [ctx.chat.id]);
    }
  }
);
bot.hears(MessageCommand.Ping, () => {
  broadCast("pong", [channelId]);
});
function checkUpdatesAutomatically() {
  const puppy = new PuppeteerClass();
  puppy
    .visitAndIntercept()
    .then(({ error, availableDays, captchaToken, bearerToken }) => {
      console.log("/try function availableDays", availableDays);
      if (error) {
        bot.telegram.sendMessage(
          userChatIds[0],
          "Failed to get Available Days, due to captcha"
        );
      }
      availableDays.forEach((day) => {
        broadCast(`Есть записи на ${formatRussianDate(day)}`, [channelId]);
        // getAvailableTimeForDay(
        //   siteUrl,
        //   day,
        //   captchaToken,
        //   bearerToken ?? ""
        // ).then(({ data }: AxiosResponse<TimeRequest[]>) => {
        //   data.forEach((timeOfDay) =>
        //     broadCast(
        //       "Доступна запись на " +
        //         formatDateTimestampForRequest(timeOfDay.dateTime),
        //       [channelId]
        //     )
        //   );
        // });
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

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
