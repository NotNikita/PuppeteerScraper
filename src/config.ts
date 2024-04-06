import dotenv from "dotenv";
import { PuppeteerLaunchOptions } from "puppeteer";

dotenv.config();

const IS_PROD = !!process.env.PROD === true;

/**
 * Argument guide:
 * --no-sandbox: Disables the Chrome sandbox
 * --disable-gpu: Disables GPU hardware acceleration, which may be necessary in headless environments or virtual machines.
 * Saving memory+Reducing perfomance:
 * --single-process: Forces Chrome to run in a single process (heroku had problems with this?)
 * --no-zygote: Disables the zygote process, which is used as a template for creating new Chrome processes.
 */
export const BROWSER_LAUNCHING_SETTINGS: PuppeteerLaunchOptions = IS_PROD
  ? {
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-gpu",
        "--single-process",
        "--no-zygote",
      ],
    }
  : {
      headless: false,
      args: ["--no-sandbox"],
    };

export const BOT_TOKEN = process.env.BOT_TOKEN || "";
