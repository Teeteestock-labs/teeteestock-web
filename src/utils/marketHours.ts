export function getTaipeiTime(date: Date = new Date()): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  dayOfWeek: number;
} {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0', 10);

  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  const hour = getPart('hour');
  const minute = getPart('minute');
  const second = getPart('second');

  const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Taipei',
    weekday: 'short',
  });
  const weekdayParts = weekdayFormatter.formatToParts(date);
  const weekdayStr = weekdayParts.find(p => p.type === 'weekday')?.value || '';
  
  const map: Record<string, number> = {
    'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
  };
  const dayOfWeek = map[weekdayStr] !== undefined ? map[weekdayStr] : date.getDay();

  return { year, month, day, hour, minute, second, dayOfWeek };
}

export function getTaipeiDateString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find(p => p.type === 'year')?.value || '';
  const month = parts.find(p => p.type === 'month')?.value || '';
  const day = parts.find(p => p.type === 'day')?.value || '';
  return `${year}-${month}-${day}`;
}

export function getTaipeiTimeStr(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Taipei',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const hour = parts.find(p => p.type === 'hour')?.value || '00';
  const minute = parts.find(p => p.type === 'minute')?.value || '00';
  return `${hour}:${minute}`;
}

export function getCurrentMarketStatus(date: Date = new Date()): 'CLOSED' | 'PRE_MARKET' | 'OPEN' | 'SETTLING' {
  const tz = getTaipeiTime(date);
  const totalMinutes = tz.hour * 60 + tz.minute;

  // SETTLING: 週一全天 (dayOfWeek === 1) 至 週二 18:45 前 (dayOfWeek === 2 && totalMinutes < 1125)
  if (tz.dayOfWeek === 1 || (tz.dayOfWeek === 2 && totalMinutes < 1125)) {
    return 'SETTLING';
  }

  // PRE_MARKET: 18:45 ~ 19:00 (1125 <= totalMinutes < 1140)
  if (totalMinutes >= 1125 && totalMinutes < 1140) {
    return 'PRE_MARKET';
  }

  // OPEN: 19:00 ~ 24:00 (1140 <= totalMinutes < 1440)
  if (totalMinutes >= 1140 && totalMinutes < 1440) {
    return 'OPEN';
  }

  return 'CLOSED';
}

export function isPreMarketPeriod(date: Date = new Date()): boolean {
  if (process.env.BYPASS_MARKET_HOURS === 'true') {
    return false;
  }
  return getCurrentMarketStatus(date) === 'PRE_MARKET';
}

export function isOperatingPeriod(date: Date = new Date()): boolean {
  if (process.env.BYPASS_MARKET_HOURS === 'true') {
    return true;
  }
  return getCurrentMarketStatus(date) === 'OPEN';
}

export function isMarketOpen(date: Date = new Date()): boolean {
  return isOperatingPeriod(date);
}

export interface TradingDayInfo {
  year: number;
  month: number;
  day: number;
  dateStr: string;
}

export function getActiveTradingDay(date: Date = new Date()): TradingDayInfo {
  const check = new Date(date.getTime());
  for (let i = 0; i < 10; i++) {
    const t = getTaipeiTime(check);
    const isTradingDay = t.dayOfWeek !== 1; // Tue to Sun
    if (isTradingDay) {
      if (i === 0) {
        const isPast1745 = t.hour > 17 || (t.hour === 17 && t.minute >= 45);
        if (isPast1745) {
          return { year: t.year, month: t.month, day: t.day, dateStr: `${t.year}-${String(t.month).padStart(2, '0')}-${String(t.day).padStart(2, '0')}` };
        }
      } else {
        return { year: t.year, month: t.month, day: t.day, dateStr: `${t.year}-${String(t.month).padStart(2, '0')}-${String(t.day).padStart(2, '0')}` };
      }
    }
    check.setTime(check.getTime() - 24 * 60 * 60 * 1000);
  }
  const t = getTaipeiTime(date);
  return { year: t.year, month: t.month, day: t.day, dateStr: `${t.year}-${String(t.month).padStart(2, '0')}-${String(t.day).padStart(2, '0')}` };
}

export function getTaipeiSessionRange(year: number, month: number, day: number) {
  const startUTC = new Date(Date.UTC(year, month - 1, day, 10, 0, 0)); // 18:00 Taipei
  const endUTC = new Date(Date.UTC(year, month - 1, day, 16, 0, 0)); // 24:00 Taipei
  return { startUTC, endUTC };
}

export function getPreviousSundayEndInTaipei(now: Date = new Date()): Date {
  const tz = getTaipeiTime(now);
  const tzDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }));
  const daysToSubtract = tz.dayOfWeek === 0 ? 6 : tz.dayOfWeek - 1;
  tzDate.setDate(tzDate.getDate() - daysToSubtract);
  const year = tzDate.getFullYear();
  const month = tzDate.getMonth() + 1;
  const day = tzDate.getDate();
  const mondayStartStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00+08:00`;
  return new Date(mondayStartStr);
}

export function getNextSettlementBoundary(now: Date = new Date()): Date {
  const tz = getTaipeiTime(now);
  const daysToNextTuesday = (9 - tz.dayOfWeek) % 7 || 7;
  const tzDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }));
  tzDate.setDate(tzDate.getDate() + daysToNextTuesday - 1);
  const year = tzDate.getFullYear();
  const month = tzDate.getMonth() + 1;
  const day = tzDate.getDate();
  return new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00+08:00`);
}

