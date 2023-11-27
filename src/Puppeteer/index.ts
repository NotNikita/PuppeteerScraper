import puppeteer, { Browser, Page } from "puppeteer";
import { Operation } from "../types";
import { wnioskiText } from "../constants";
import puppeteerExtra from "puppeteer-extra";
import Stealth from "puppeteer-extra-plugin-stealth";
import { getQueryParams } from "../helpers";

const buttons: Map<Operation, string> = new Map([
  [Operation.ObywatelstwoPolskie, ""],  
  [Operation.OdbiorKartyPobytu, ""],
  [Operation.OdbiorPaszportu, ""],
  [Operation.SkladanieWnioskow, ""],
  [Operation.UzeskanieStempla, ""],
  [Operation.ZlozenieWniosku, wnioskiText],
]);

export class PuppeteerClass {
  browser: Browser | undefined;
  page: Page | undefined;
  // Warsaw
  latitude = 52.237049;
  longitude = 21.017532;
  siteUrl = "https://rejestracjapoznan.poznan.uw.gov.pl/";
  availableDays: string[] = [];
  recaptchaToken: string | null = "";

  constructor() {}

  async createBrowser() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });
  }

  async initiatePage() {
    this.page = await this.browser?.newPage();
  }

  async overrideLocation() {
    await this.page
      ?.browserContext()
      .overridePermissions(this.siteUrl, ["geolocation"]);
    await this.page?.setGeolocation({
      latitude: this.latitude,
      longitude: this.longitude,
    });
  }

  async getAvailableTimeForDate() {}

  visitAndIntercept() {
    const targetUrl = `${this.siteUrl}api/Slot/GetAvailableDaysForOperation`;

    return new Promise<string[]>((resolve) => {
      puppeteerExtra.use(Stealth());
      puppeteerExtra.launch({ headless: true }).then(async (browser) => {
        this.browser = browser;
        this.page = await this.browser?.newPage();

        this.page?.on("response", async (response) => {
          const request = response.request();
          const requestUrl = request.url();
          if (requestUrl.includes(targetUrl)) {
            this.recaptchaToken =
              getQueryParams(requestUrl).get("recaptchaToken");
            const jsonedResponse = await response.json();
            this.availableDays = jsonedResponse.availableDays;
            await this.browser?.close();
            resolve(this.availableDays);
          }
        });

        await this.page?.goto(this.siteUrl, { timeout: 20000 });
        await this.page?.setViewport({ width: 1080, height: 1500 });

        const targetButton = "#Operacja0 .row:nth-child(5)";
        const dalejButton = "button.btn.footer-btn.btn-secondary";

        await this.page?.waitForSelector(targetButton);
        await this.page?.click(targetButton);
        await this.page?.waitForSelector(dalejButton);

        console.log("Interception completed\n\n");
      });
    });
  }
}
