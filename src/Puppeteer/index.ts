import puppeteer, { Browser, Page } from 'puppeteer';
import { Accumulator, Operation } from '../types';
import { wnioskiText, wnioskiText1 } from '../constants';
import puppeteerExtra from 'puppeteer-extra';
import Stealth from 'puppeteer-extra-plugin-stealth';

const buttons: Map<Operation, string> = new Map([
  [Operation.ObywatelstwoPolskie, ''],
  [Operation.OdbiorKartyPobytu, ''],
  [Operation.OdbiorPaszportu, ''],
  [Operation.SkladanieWnioskow, ''],
  [Operation.UzeskanieStempla, ''],
  [Operation.ZlozenieWniosku, wnioskiText],
]);

export class PuppeteerClass {
  browser: Browser | undefined;
  page: Page | undefined;
  // Warsaw
  latitude = 52.237049;
  longitude = 21.017532;
  siteUrl = 'https://rejestracjapoznan.poznan.uw.gov.pl/';
  availableDays: string[] = [];

  constructor() {
    // this.createBrowser();
  }

  async createBrowser() {
    this.browser = await puppeteer.launch({ headless: false });
  }

  async initiatePage() {
    this.page = await this.browser?.newPage();
  }

  async overrideLocation() {
    await this.page
      ?.browserContext()
      .overridePermissions(this.siteUrl, ['geolocation']);
    await this.page?.setGeolocation({
      latitude: this.latitude,
      longitude: this.longitude,
    });
  }

  visitAndIntercept() {
    const targetUrl = `${this.siteUrl}api/Slot/GetAvailableDaysForOperation`;

    return new Promise<string[]>((resolve) => {
      puppeteerExtra.use(Stealth());
      puppeteerExtra.launch({ headless: false }).then(async (browser) => {
        this.browser = browser;
        this.page = await this.browser?.newPage();

        this.page?.on('response', async (response) => {
          const request = response.request();
          if (request.url().includes(targetUrl)) {
            const jsonedResponse = await response.json();
            console.log(jsonedResponse);
            this.availableDays = jsonedResponse.availableDays;
            await this.browser?.close();
            resolve(this.availableDays);
          }
        });

        await this.page?.goto(this.siteUrl, { timeout: 20000 });
        await this.page?.setViewport({ width: 1080, height: 1500 });

        const targetButton = '#Operacja0 .row:nth-child(5)';
        const dalejButton = 'button.btn.footer-btn.btn-secondary';

        await this.page?.waitForSelector(targetButton);
        await this.page?.click(targetButton);
        await this.page?.waitForSelector(dalejButton);

        console.log('Interception completed\n\n');
      });
    });
  }

  async interceptingRequests() {
    const targetUrl = `${this.siteUrl}api/Slot/GetAvailableDaysForOperation`;
    puppeteerExtra.use(Stealth());
    this.browser = await puppeteerExtra.launch({ headless: false });
    this.page = await this.browser?.newPage();

    await this.page?.setRequestInterception(true);
    this.page?.on('request', async (request) => {
      if (request.url().startsWith(targetUrl)) {
        console.log('request url:', await request.url());
        console.log('request status:', await request);
        console.log('request headers:', request.headers());
        request.continue();
      } else {
        request.continue();
      }
    });

    await this.page?.goto(this.siteUrl, { timeout: 20000 });
    await this.page?.setViewport({ width: 1080, height: 1500 });

    const targetButton = '#Operacja0 .row:nth-child(5)';
    const dalejButton = 'button.btn.footer-btn.btn-secondary';

    await this.page?.waitForSelector(targetButton);
    await this.page?.click(targetButton);
    await this.page?.waitForSelector(dalejButton);

    console.log('Interception completed\n\n');
  }

  async visitPageAndClick() {
    try {
      await this.initiatePage();

      if (this.page) {
        await this.page.goto('https://rejestracjapoznan.poznan.uw.gov.pl/');
        await this.page.setViewport({ width: 1080, height: 1500 });

        // const targetButton = `.operation-button:contains("${buttons.get(
        //   selectedAction,
        // )}")`;
        const targetButton = '#Operacja0 .row:nth-child(5)';
        const dalejButton = 'button.btn.footer-btn.btn-secondary';

        await this.page.waitForSelector(targetButton);
        await this.page.click(targetButton);
        await this.page.waitForSelector(dalejButton);
        await this.page.click(dalejButton);

        await this.page.waitForSelector('div.vc-weeks');
        const allDaysPromises = await this.page.$$('.vc-weeks .vc-day-content');
        const allDays = allDaysPromises.map(async (d) =>
          d.evaluate(async (element) => await element.outerHTML),
        );

        console.log('all days', allDays);

        // const { activeDays, disabledDays } = allDays.reduce<Accumulator>(
        //   (acc, day) => {
        //     // Replace this condition with your actual condition for active or disabled days
        //     const isActive = true;

        //     // Push the day into the corresponding array based on the condition
        //     if (isActive) {
        //       acc.activeDays.push(day);
        //     } else {
        //       acc.disabledDays.push(day);
        //     }

        //     return acc;
        //   },
        //   { activeDays: [], disabledDays: [] },
        // );
        // console.log(
        //   'Days: ',
        //   JSON.stringify(activeDays),
        //   JSON.stringify(disabledDays),
        // );
      } else {
        console.error('Empty page and browser:', this.page, this.browser);
        if (this.browser) {
          await this.browser.close();
        }
      }
    } catch (error) {
      console.error('Error during page visit:', error, this.page, this.browser);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}
