### Approaches, that can help to hide from Captchas:

Here is a list of things I'm doing to bypass the captchas and similar blockings:

- Enable stealth mode (via puppeteer-extra-plugin-stealth)
- Randomize User-agent or Set a valid one (via random-useragent)
- Randomize Viewport size
- Skip images/styles/fonts loading for better performance
- Pass "WebDriver check"
- Pass "Chrome check"
- Pass "Notifications check"
- Pass "Plugins check"
- Pass "Languages check"

### bot.hears: This method is used to match and handle regular text messages that users send to the bot. It's typically used for commands or specific keywords that users might type in the chat.

Example:

> bot.hears('hello', (ctx) => {
> ctx.reply('Hi there!');
> });

### bot.action: This method is used specifically for handling inline button presses in inline keyboards. It's often used in conjunction with Markup.inlineKeyboard to create interactive buttons.

Example:

> javascript
> Copy code
> const { Markup } = require('telegraf');
>
> bot.action('button_click', (ctx) => {
> ctx.reply('Button clicked!');
> });
>
> bot.command('menu', (ctx) => {
> ctx.reply('Choose an option:', Markup.inlineKeyboard([
> > Markup.button.callback('Click me', 'button_click'),
> > ]));
> });
