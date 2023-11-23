import { ElementHandle } from 'puppeteer';

export enum MessageCommand {
  Start = 'Start',
  Operacje = 'Wybierz Operacje',
  Jezyk = 'Wybierz Język',
  Clear = '/clear',
  Restart = '/restart',
  Stop = '/stop',
  CheckManually = 'Проверить',
}

export enum BotLanguage {
  Polska = 'Polska',
  Russian = 'Russian',
  English = 'English',
}

export enum Operation {
  SkladanieWnioskow = 'Skladanie Wnioskow',
  OdbiorPaszportu = 'Odbior Paszportu',
  OdbiorKartyPobytu = 'Odbior Karty Pobytu',
  ZlozenieWniosku = 'Zlozenie Wniosku',
  UzeskanieStempla = 'Uzeskanie Stempla',
  ObywatelstwoPolskie = 'Obywatelstwo Polskie',
}

export interface Accumulator {
  activeDays: ElementHandle<any>[];
  disabledDays: ElementHandle<any>[];
}
