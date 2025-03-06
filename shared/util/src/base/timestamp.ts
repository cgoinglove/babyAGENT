const s = 1000;
const m = s * 60;
const h = m * 60;
const d = h * 24;

const SECONDS = (timestamp: number = 1) => s * timestamp;
SECONDS.FROM = (SECONDS: number) => SECONDS / s;

const MINUTES = (timestamp: number = 1) => m * timestamp;
MINUTES.FROM = (MINUTES: number) => MINUTES / m;

const HOURS = (timestamp: number = 1) => h * timestamp;
HOURS.FROM = (HOURS: number) => HOURS / h;

const DAYS = (timestamp: number = 1) => d * timestamp;
DAYS.FROM = (DAYS: number) => DAYS / d;

const WEEKS = (timestamp: number = 1) => d * 7 * timestamp;
WEEKS.FROM = (WEEKS: number) => WEEKS / 7 / d;

const YEARS = (timestamp: number = 1) => d * 365 * timestamp;
YEARS.FROM = (YEARS: number) => YEARS / d / 365;

export const TIME = {
  SECONDS,
  MINUTES,
  HOURS,
  DAYS,
  WEEKS,
  YEARS,
};
