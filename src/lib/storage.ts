const DAILY_DATE_KEY = "tarot_daily_date";
const DAILY_COUNT_KEY = "tarot_daily_count";
const SHARE_BONUS_KEY = "tarot_share_bonus";
const LAST_READING_KEY = "tarot_last_reading";

function isClient(): boolean {
  return typeof window !== "undefined";
}

function resetIfNewDay(): void {
  if (!isClient()) return;
  const today = new Date().toDateString();
  const stored = localStorage.getItem(DAILY_DATE_KEY);
  if (stored !== today) {
    localStorage.setItem(DAILY_DATE_KEY, today);
    localStorage.setItem(DAILY_COUNT_KEY, "0");
    localStorage.setItem(SHARE_BONUS_KEY, "0");
  }
}

export function getRemainingReadings(): number {
  if (!isClient()) return 99;
  resetIfNewDay();
  const count = parseInt(localStorage.getItem(DAILY_COUNT_KEY) || "0", 10);
  const bonus = parseInt(localStorage.getItem(SHARE_BONUS_KEY) || "0", 10);
  return Math.max(0, 99 - (count + bonus));
}

export function useReading(): boolean {
  if (!isClient()) return true; // SSR default: allow
  resetIfNewDay();
  const remaining = getRemainingReadings();
  if (remaining <= 0) return false;

  const count = parseInt(localStorage.getItem(DAILY_COUNT_KEY) || "0", 10);
  const bonus = parseInt(localStorage.getItem(SHARE_BONUS_KEY) || "0", 10);

  if (count < 1) {
    localStorage.setItem(DAILY_COUNT_KEY, String(count + 1));
  } else if (bonus < 1) {
    localStorage.setItem(SHARE_BONUS_KEY, String(bonus + 1));
  }

  return true;
}

export function grantShareBonus(): void {
  if (!isClient()) return;
  resetIfNewDay();
  const bonus = parseInt(localStorage.getItem(SHARE_BONUS_KEY) || "0", 10);
  if (bonus < 1) {
    localStorage.setItem(SHARE_BONUS_KEY, "1");
  }
}

export interface LastReading {
  cardId: number;
  cardName: string;
  isReversed: boolean;
  question: string;
  reading: string;
  timestamp: number;
}

export function saveLastReading(reading: LastReading): void {
  if (!isClient()) return;
  localStorage.setItem(LAST_READING_KEY, JSON.stringify(reading));
}

export function getLastReading(): LastReading | null {
  if (!isClient()) return null;
  const raw = localStorage.getItem(LAST_READING_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LastReading;
  } catch {
    return null;
  }
}
