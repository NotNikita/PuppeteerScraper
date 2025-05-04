import { PuppeteerLaunchOptions } from "puppeteer";
import { timestampOptions as options } from "./constants";
import { readFileSync } from "fs";
import { PROXY_REQUEST_TYPE } from "./config";

export function formatRussianDate(timestampString: string) {
  const date = new Date(timestampString);

  const dateFormatter = new Intl.DateTimeFormat("ru-RU", options);
  return dateFormatter.format(date);
}

export function getQueryParams(urlString: string): URLSearchParams {
  const url = new URL(urlString);
  return url.searchParams;
}
export function formatDateTimestampForRequest(inputDateString: string): string {
  const inputDate = new Date(inputDateString);
  return `Доступна новая запись: ${inputDate.getFullYear()}-${(
    inputDate.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${inputDate.getDate().toString().padStart(2, "0")}`;
}

export function randomizeViewPorts(): [width: number, height: number] {
  const width = Math.floor(Math.random() * (1600 - 700 + 1)) + 700;
  const height = Math.floor(Math.random() * (1750 - 1200 + 1)) + 1200;
  return [width, height];
}

interface ProxyFromFile {
  url: string;
  port: string;
  username: string;
  password: string;
}
export function getRandomProxyFromFile(
  filepath = "./proxies.txt"
): ProxyFromFile {
  // Read the file contents synchronously
  const fileContent = readFileSync(filepath, "utf8");

  // Split the file contents into lines
  const lines = fileContent.trim().split("\n");

  // Pick a random line from the array of lines
  const randomLine = lines[Math.floor(Math.random() * lines.length)];

  // Split the random line by ':' to get url, port, username, and password
  const [url, port, username, password] = randomLine.split(":");

  return { url, port, username, password } as const;
}

export function configureLaunchSettings(
  initialSettings: PuppeteerLaunchOptions
): PuppeteerLaunchOptions {
  const { url, port } = getRandomProxyFromFile();
  const proxySetting = `--proxy-server=${PROXY_REQUEST_TYPE}://${url}:${port}`;
  console.log("Selected proxy", proxySetting);
  const newArguments = initialSettings.args
    ? [...initialSettings.args, proxySetting]
    : [proxySetting];
  return {
    ...initialSettings,
    args: newArguments,
  };
}
