import { Browser, Page } from "puppeteer";
import puppeteerExtra from "puppeteer-extra";
import Stealth from "puppeteer-extra-plugin-stealth";
import UserAgent from "user-agents";
import { getQueryParams, randomizeViewPorts } from "../helpers";
import { BROWSER_LAUNCHING_SETTINGS } from "../config";
import { VisitAndInterceptType } from "../types";

export const siteUrl = "https://rejestracjapoznan.poznan.uw.gov.pl/";
const targetUrl = `${siteUrl}api/Slot/GetAvailableDaysForOperation`;
const targetButton = "#Operacja0 .row:nth-child(5)";
const dalejButton = "button.btn.footer-btn.btn-secondary";

export class PuppeteerClass {
  browser: Browser | undefined;
  page: Page | undefined;
  // Warsaw
  latitude = 52.237049;
  longitude = 21.017532;
  availableDays: string[] | undefined = [];
  recaptchaToken: string | null = "";
  bearerToken: string | null = "";
  defaultAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36";

  constructor() {}

  async initiatePage() {
    this.page = await this.browser?.newPage();
  }

  async overrideLocation() {
    await this.page
      ?.browserContext()
      .overridePermissions(siteUrl, ["geolocation"]);
    await this.page?.setUserAgent(this.defaultAgent);
    await this.page?.setGeolocation({
      latitude: this.latitude,
      longitude: this.longitude,
    });
  }

  async getAvailableTimeForDate() {}

  visitAndIntercept(): Promise<VisitAndInterceptType> {
    const [width, height] = randomizeViewPorts();
    const newAgent = new UserAgent().random().toString();
    let isFailedToSolveCaptcha;
    try {
      return new Promise<VisitAndInterceptType>((resolve) => {
        puppeteerExtra.use(Stealth());
        puppeteerExtra
          .launch(BROWSER_LAUNCHING_SETTINGS)
          .then(async (browser) => {
            this.browser = browser;
            this.page = await this.browser?.newPage();
            this.page.setUserAgent(newAgent ?? this.defaultAgent);
            this.page.setJavaScriptEnabled(true);

            this.page?.on("response", async (response) => {
              const request = response.request();
              const requestUrl = request.url();

              if (requestUrl.includes(targetUrl)) {
                const requestHeaders = request.headers();
                this.bearerToken = requestHeaders.authorization;
                this.recaptchaToken =
                  getQueryParams(requestUrl).get("recaptchaToken");
                const jsonedResponse = await response.json();
                console.log("jsonedResponse", jsonedResponse);
                await this.browser?.close();
                isFailedToSolveCaptcha =
                  jsonedResponse === "Error while verify captcha";
                resolve({
                  error: isFailedToSolveCaptcha,
                  availableDays: isFailedToSolveCaptcha
                    ? []
                    : jsonedResponse.availableDays,
                  captchaToken: this.recaptchaToken,
                  bearerToken: this.bearerToken,
                });
              }
            });

            await this.page?.goto(siteUrl, { timeout: 0 });
            // await this.page?.waitForNavigation();
            await this.page?.setViewport({ width, height });

            await this.page?.waitForSelector(targetButton);
            await this.page?.click(targetButton);
            await this.page?.waitForSelector(dalejButton);

            console.log("Interception completed\n\n");
          });
      });
    } catch (e) {
      return new Promise<VisitAndInterceptType>((resolve) =>
        resolve({
          error: true,
          availableDays: ["Error"],
          captchaToken: "",
          bearerToken: "",
        })
      );
    } finally {
      this.browser?.close();
    }
  }
}
