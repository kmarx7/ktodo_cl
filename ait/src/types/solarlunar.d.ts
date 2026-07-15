declare module "solarlunar" {
  interface SolarLunarResult {
    lYear: number;
    lMonth: number;
    lDay: number;
    isLeap: boolean;
    [key: string]: unknown;
  }
  interface SolarLunar {
    solar2lunar(year: number, month: number, day: number): SolarLunarResult;
  }
  const solarlunar: SolarLunar;
  export default solarlunar;
}
