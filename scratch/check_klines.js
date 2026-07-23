const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const klines = await prisma.kLineHistory.findMany({
    orderBy: { timestamp: 'asc' }
  });

  console.log(`Total KLine records: ${klines.length}`);
  
  const invalidKLines = [];
  
  for (const k of klines) {
    const date = new Date(k.timestamp);
    // Convert to Taipei Time
    const taipeiStr = date.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false });
    // Match the hour using regex
    const timeMatch = taipeiStr.match(/ (\d{2}):(\d{2}):(\d{2})$/);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1], 10);
      const min = parseInt(timeMatch[2], 10);
      const dayOfWeek = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
      
      // Trading hours: Tue-Sun 19:00 - 24:00 (i.e. 19:00 to 23:59)
      // So hour should be between 19 and 23.
      // Day of week should not be Monday (1).
      const isTradingHour = (hour >= 19 && hour <= 23) && (dayOfWeek !== 1);
      
      if (!isTradingHour) {
        invalidKLines.push({
          id: k.id,
          pairId: k.pairId,
          timestamp: k.timestamp,
          taipeiTime: taipeiStr,
          dayOfWeek,
          open: k.open,
          close: k.close,
          volume: k.volume.toString()
        });
      }
    }
  }

  console.log(`Invalid KLines count: ${invalidKLines.length}`);
  if (invalidKLines.length > 0) {
    console.log("Sample invalid KLines:", invalidKLines.slice(0, 20));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
