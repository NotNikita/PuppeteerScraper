import { token } from './auth';
import { formatRussianDate } from './helpers';
import { PuppeteerClass } from './Puppeteer';
import { BotLanguage, MessageCommand, Operation } from './types';
import { Telegraf } from 'telegraf';

// polling allows the bot to listen for and receive new messages
const bot = new Telegraf(token);
const userChatIds = [336972408];
let language = BotLanguage.Polska;
let trackedOperations: Operation[] = [Operation.SkladanieWnioskow];
let intervalId: NodeJS.Timeout | undefined;

bot.start((ctx) => {
  ctx.reply('Bot started. Choose an action:', {
    ...keyboards.start_menu,
  });
  if (!userChatIds.includes(ctx.chat.id)) {
    userChatIds.push(ctx.chat.id);
  }
});
bot.hears(MessageCommand.Restart, () => {
  intervalId = setInterval(checkUpdatesAutomatically, 1 * 10000);
});
bot.hears(MessageCommand.Stop, () => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
bot.hears(MessageCommand.Clear, (ctx) => {
  trackedOperations = [];
  ctx.reply('Lista obserwowanych została wyczyszczona');
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
    broadCast('Пусто', [ctx.chat.id]);
  }
});
function checkUpdatesAutomatically() {
  const puppy = new PuppeteerClass();
  puppy
    .visitAndIntercept()
    .then((availableDays) => {
      console.log('/try function availableDays', availableDays);
      availableDays.forEach((day) => {
        broadCast(formatRussianDate(day));
      });
    })
    .catch((error) => {
      console.error('Error in update:', error);
      broadCast(`Error: ${error.message}`);
    });
}

// Run the code every 5 minutes (300,000 milliseconds)
function broadCast(message = 'привет', users = userChatIds) {
  console.log('members count', userChatIds.length);
  users.forEach((chatId) => {
    bot.telegram.sendMessage(chatId, message);
  });
}
bot.hears('/shout', async () => {
  broadCast();
});
// ------------ OPERATIONS MENU ----------------
bot.hears(MessageCommand.Operacje, (ctx) => {
  ctx.reply('Obsługiwane języki:', keyboards.operations);
});
bot.action(Operation.SkladanieWnioskow, (ctx) => {
  if (!trackedOperations.some((o) => o === Operation.SkladanieWnioskow)) {
    trackedOperations.push(Operation.SkladanieWnioskow);
  }
  // MAIN LOGIC
  ctx.reply('język zmieniony');
});

// ------------ LANGUAGE MENU ----------------
bot.hears(MessageCommand.Jezyk, (ctx) => {
  ctx.reply('Obsługiwane języki:', keyboards.languages);
});
bot.action(BotLanguage.Polska, (ctx) => {
  language = BotLanguage.Polska;
  ctx.reply('język zmieniony');
});
bot.action(BotLanguage.Russian, (ctx) => {
  language = BotLanguage.Russian;
  ctx.reply('язык изменен');
});
bot.action(BotLanguage.English, (ctx) => {
  language = BotLanguage.English;
  ctx.reply('language changed');
});

// Start the bot using polling
bot.launch().then(() => {
  console.log('Bot is running with polling');
});

const keyboards = {
  start_menu: {
    reply_markup: {
      keyboard: [[{ text: MessageCommand.CheckManually }]],
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

// ------------ FAST LANGUAGE CHANGE ----------------
bot.hears('czecz' || 'Czecz' || 'Cześć' || 'cześć', (ctx) => {
  language = BotLanguage.Polska;
  ctx.reply('Sie ma!');
});
bot.hears('Ку' || 'ку' || 'Привет' || 'привет', (ctx) => {
  language = BotLanguage.Russian;
  ctx.reply('Привет!');
});
bot.hears('hello' || 'Hello', (ctx) => {
  language = BotLanguage.English;
  ctx.reply('Hello there!');
});
