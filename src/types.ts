export enum MessageCommand {
  Start = "Start",
  Operacje = "Wybierz Operacje",
  Jezyk = "Wybierz Język",
  Clear = "/clear",
  Restart = "/restart",
  Stop = "/stop",
  CheckManually = "/check",
  Ping = "/ping",
}

export enum BotLanguage {
  Polska = "Polska",
  Russian = "Russian",
  English = "English",
}

export enum Operation {
  SkladanieWnioskow = "Skladanie Wnioskow",
  OdbiorPaszportu = "Odbior Paszportu",
  OdbiorKartyPobytu = "Odbior Karty Pobytu",
  ZlozenieWniosku = "Zlozenie Wniosku",
  UzeskanieStempla = "Uzeskanie Stempla",
  ObywatelstwoPolskie = "Obywatelstwo Polskie",
}
