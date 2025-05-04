import { Browser, HTTPResponse, Page } from "puppeteer";
import puppeteerExtra from "puppeteer-extra";
import Stealth from "puppeteer-extra-plugin-stealth";
import UserAgent from "user-agents";
import {
  configureLaunchSettings,
  getQueryParams,
  getRandomProxyFromFile,
  randomizeViewPorts,
} from "../helpers";
import {
  BROWSER_LAUNCHING_SETTINGS,
  PROXY_PASSWORD,
  PROXY_USERNAME,
} from "../config";
import { VisitAndInterceptType } from "../types";

export const siteUrl = "https://rejestracjapoznan.poznan.uw.gov.pl/";
const TARGET_URL = `${siteUrl}api/Slot/GetAvailableDaysForOperation`;
const TARGET_BUTTON = ".wizard-tab-content .row:nth-child(6)";
const DALEJ_BUTTON = "button.btn.footer-btn.btn-secondary";
const BLOCKED_REQUEST_TYPES = ["image", "stylesheet", "font"];

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

  // Masovian Voivodeship bounds
  private readonly MASOVIAN_BOUNDS = {
    minLat: 51.0, // Southern boundary
    maxLat: 53.5, // Northern boundary
    minLng: 19.0, // Western boundary
    maxLng: 23.0, // Eastern boundary
  };

  // Add human-like behavior settings
  private readonly HUMAN_BEHAVIOR = {
    minDelay: 100, // Minimum delay between actions in ms
    maxDelay: 3000, // Maximum delay between actions in ms
    mouseSpeed: 0.5, // Mouse movement speed (0-1)
  };

  /**
   * Generates random coordinates within Masovian Voivodeship
   */
  private getRandomMasovianCoordinates() {
    const latitude =
      Math.random() *
        (this.MASOVIAN_BOUNDS.maxLat - this.MASOVIAN_BOUNDS.minLat) +
      this.MASOVIAN_BOUNDS.minLat;
    const longitude =
      Math.random() *
        (this.MASOVIAN_BOUNDS.maxLng - this.MASOVIAN_BOUNDS.minLng) +
      this.MASOVIAN_BOUNDS.minLng;

    return {
      latitude: Number(latitude.toFixed(6)),
      longitude: Number(longitude.toFixed(6)),
    } as const;
  }

  /**
   * Adds random delay to simulate human behavior
   */
  private async randomDelay(): Promise<void> {
    const delay =
      Math.floor(
        Math.random() *
          (this.HUMAN_BEHAVIOR.maxDelay - this.HUMAN_BEHAVIOR.minDelay)
      ) + this.HUMAN_BEHAVIOR.minDelay;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Simulates human-like mouse movement
   */
  private async moveMouseLikeHuman(): Promise<void> {
    if (!this.page) return;

    const viewport = await this.page.viewport();
    if (!viewport) return;

    // Get random coordinates within viewport
    const x = Math.floor(Math.random() * viewport.width);
    const y = Math.floor(Math.random() * viewport.height);

    // Move mouse with random speed
    await this.page.mouse.move(x, y, {
      steps: Math.floor(Math.random() * 10) + 5,
    });
  }
  constructor() {
    const { latitude, longitude } = this.getRandomMasovianCoordinates();
    this.latitude = latitude;
    this.longitude = longitude;
  }

  async initiatePage(username: string, password: string, agent: string) {
    this.page = await this.browser?.newPage();

    if (!this.page) return;
    // await this.page.authenticate({
    //   username: PROXY_USERNAME ?? username,
    //   password: PROXY_PASSWORD ?? password,
    // });
    // Set additional browser properties
    await this.page.setExtraHTTPHeaders({
      "Accept-Language": "pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
    });

    this.page.setUserAgent(agent);

    // Set viewport to a common resolution
    await this.page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: true,
    });

    // Enable JavaScript and cookies
    await this.page.setJavaScriptEnabled(true);

    // Set timezone to Warsaw
    await this.page.emulateTimezone("Europe/Warsaw");
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

    // Add human-like behavior before interacting with the page
    await this.randomDelay();
    await this.moveMouseLikeHuman();
    await this.randomDelay();
  }

  visitAndIntercept(): Promise<VisitAndInterceptType> {
    const [width, height] = randomizeViewPorts();
    const { username, password } = getRandomProxyFromFile();
    const LAUNCH_SETTINGS = configureLaunchSettings(BROWSER_LAUNCHING_SETTINGS);
    console.log("LAUNCH_SETTINGS", LAUNCH_SETTINGS);
    console.log("creds", username, password);
    const newAgent = new UserAgent().random().toString();
    try {
      return new Promise<VisitAndInterceptType>((resolve) => {
        puppeteerExtra.use(Stealth());
        puppeteerExtra.launch(LAUNCH_SETTINGS).then(async (browser) => {
          this.browser = browser;
          this.page = await this.browser?.newPage();
          await this.initiatePage(
            PROXY_USERNAME ?? username,
            PROXY_PASSWORD ?? password,
            newAgent ?? this.defaultAgent
          );

          // Add random delays between actions
          await this.randomDelay();
          await this.moveMouseLikeHuman();

          this.page?.on("response", this.responseInterceptor(resolve));

          await this.page?.goto(siteUrl, { timeout: 0 });
          // await this.page?.waitForNavigation();

          await this.page?.waitForSelector(TARGET_BUTTON);
          await this.page?.click(TARGET_BUTTON);
          await this.page?.waitForSelector(DALEJ_BUTTON);

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

  responseInterceptor(
    resolver: (
      value: VisitAndInterceptType | PromiseLike<VisitAndInterceptType>
    ) => void
  ) {
    return async (response: HTTPResponse) => {
      const request = response.request();
      const requestUrl = request.url();

      console.log("Intercepted", requestUrl, request);

      if (requestUrl.includes(TARGET_URL)) {
        const requestHeaders = request.headers();
        this.bearerToken = requestHeaders.authorization;
        this.recaptchaToken = getQueryParams(requestUrl).get("recaptchaToken");
        const jsonedResponse = await response.json();
        console.log("jsonedResponse", jsonedResponse);
        await this.browser?.close();
        const isFailedToSolveCaptcha =
          jsonedResponse === "Error while verify captcha";
        resolver({
          error: isFailedToSolveCaptcha,
          availableDays: isFailedToSolveCaptcha
            ? []
            : jsonedResponse.availableDays,
          captchaToken: this.recaptchaToken,
          bearerToken: this.bearerToken,
        });
      }
    };
  }
}
