import axios from "axios";
import { formatDateTimestampForRequest } from "../helpers";

const getHeaders = (bearerToken: string) => ({
  authority: "rejestracjapoznan.poznan.uw.gov.pl",
  accept: "application/json, text/plain, */*",
  "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
  authorization: bearerToken,
  cookie:
    "_ga=GA1.1.1571733134.1700402830; _ga_68EKHVS4XM=GS1.1.1701081425.29.1.1701083123.0.0.0",
  dnt: "1",
  referer: "https://rejestracjapoznan.poznan.uw.gov.pl/",
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
});

export type TimeRequest = {
  id: string;
  dateTime: string;
  reservationId: string;
  reservationEnd: string;
  operationId: number;
};
export const getAvailableTimeForDay = (
  url: string,
  date: string,
  captchaToken: string | null = "",
  bearerToken: string = ""
) =>
  axios.post<TimeRequest[]>(
    `${url}api/Slot/GetAvailableSlotsForOperationAndDay`,
    {
      operationId: 8,
      day: formatDateTimestampForRequest(date),
      recaptchaToken: captchaToken,
    },
    {
      headers: getHeaders(bearerToken),
    }
  );
