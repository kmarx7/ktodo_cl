declare module "solarlunar" {
  interface SolarLunarResult {
    lYear: number;
    lMonth: number;
    lDay: number;
    isLeap: boolean;
    [key: string]: unknown;
  }
  interface SolarToLunarResult {
    cYear: number;
    cMonth: number;
    cDay: number;
    [key: string]: unknown;
  }
  interface SolarLunar {
    solar2lunar(year: number, month: number, day: number): SolarLunarResult;
    lunar2solar(
      year: number,
      month: number,
      day: number,
      isLeapMonth?: boolean
    ): SolarToLunarResult | false;
  }
  const solarlunar: SolarLunar;
  export default solarlunar;
}
