import axios from 'axios';

const bearerToken =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb21wYW55TmFtZSI6InV3cG96bmFuIiwiY29tcGFueUlkIjoiMSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6Ikd1ZXN0IiwibmJmIjoxNzAwNDIxMTQxLCJleHAiOjI1MzQwMjI5NzIwMCwiaXNzIjoiUU1TV2ViUmVzZXJ2YXRpb24uQVBJIiwiYXVkIjoiUU1TV2ViUmVzZXJ2YXRpb24uQ0xJRU5UIn0._tMaLKGrjB7cILMs2Io10UhKTUtTzKmUR0x7n7zMzIM';

export class AxiosClass {
  client: any;
  auth_token = '5e0a7d8a2e6521bf8f7c71bf2a439dd5cb9e4704';

  constructor() {}

  async availableDays(tag = 'elonmusk') {
    try {
      const response = getAvailableDays().then((response) => {
        console.log(response);
      });
    } catch (error) {
      console.error(error);
    }
    return JSON.stringify(123);
  }
}

type Day = {
  start: string;
  end: string;
};
type AvailableDays = {
  availableDays: any[];
  disabledDays: Day[];
  maxDate: string;
  minDate: string;
  operationId: number;
};
const getAvailableDays = () =>
  axios.get<AvailableDays>(
    'https://rejestracjapoznan.poznan.uw.gov.pl/api/Slot/GetAvailableDaysForOperation?operationId=8&recaptchaToken=03AFcWeA78ML882YGTxYFhIVL7OJCpR3K2Utl0AoZ6HALRpwmYiFXem1ZJ4FNd1c9_G-E3HVl24qwbqvOafw19ueuiEsR6Q-QrK4qp2zXpBvweLPoLCYlH91TolQfSG2Dj5_HSkcfU05B5jpl_MVEoamLRgwayrFu_tdLtoyjaxWKIDHpj4xW6A9Xex9XOLaNXfZQzcPXph3wYmpPTtzjj1tTJaWxT34k8M9rLL_za28pyH6e7PpIejhd6HiRcDzJ8vDUqKtswTn6oOnVrkcGBV86vgeEAtc1AQoMBi_953s8TeBgj5p5cMe0liPEG4S00CDyjYn7ccL-EUL7fZP6euVAI7sBCAK3uayM-OMEKXvLkRQg9MlYZ4MmcHED-tWQsve2mJSUV8SIiMXMHy78heIicp9Hx3yvKELZGK7xWnbXXDa9XJWYbbaDhU6JARuan3PvmFZhiRuDUOmsQfwMDbJ1a3HISMXSo89Bb8ZB_4zbLnuqDBGPhcFCfijMtP1CXCKn_vBJPx2Av0J4epGlF2LCaFrEZ1IS5JZFu_GqFsddgydTN2ax-TW1TF9_b8S9UFP628tpNClcmQLszaARQ7_Pml6UxHYcG9w',
    {
      headers: {
        Referer: '',
        'Sec-Ch-Ua-Platform': 'Windows',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Sec-Ch-Ua': `"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"`,
        Authorization: bearerToken,
        Accept: 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    },
  );
