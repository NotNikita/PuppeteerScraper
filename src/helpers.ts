import { timestampOptions as options } from "./constants";

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
