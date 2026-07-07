import { getActiveTradingDay, getTaipeiTime } from '../src/utils/marketHours';

console.log("=== Testing getActiveTradingDay ===");

const dates = [
  { name: "Friday June 26 18:00 Taipei", time: "2026-06-26T18:00:00+08:00" },
  { name: "Saturday June 27 18:00 Taipei", time: "2026-06-27T18:00:00+08:00" },
  { name: "Sunday June 28 18:00 Taipei", time: "2026-06-28T18:00:00+08:00" },
  { name: "Monday June 29 18:00 Taipei (Rest Day)", time: "2026-06-29T18:00:00+08:00" },
  { name: "Tuesday June 30 18:00 Taipei", time: "2026-06-30T18:00:00+08:00" }
];

for (const d of dates) {
  const date = new Date(d.time);
  const tz = getTaipeiTime(date);
  const tradingDay = getActiveTradingDay(date);
  console.log(`${d.name}:`);
  console.log(`  getTaipeiTime: dayOfWeek=${tz.dayOfWeek}, hour=${tz.hour}, minute=${tz.minute}`);
  console.log(`  getActiveTradingDay: ${tradingDay.dateStr}`);
}
