import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTaipeiTime, getTaipeiDateString, getActiveTradingDay, getTaipeiSessionRange } from '@/utils/marketHours';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id') || url.searchParams.get('pairId');
    const period = url.searchParams.get('period') || '1m';
    const range = url.searchParams.get('range');

    if (!id) {
      return NextResponse.json({ error: 'Missing pair id parameter' }, { status: 400 });
    }

    const pairId = id.toUpperCase();

    // Determine query condition
    const whereClause: any = { pairId };
    
    if (range) {
      const now = new Date();
      let startDate = new Date();
      
      if (range === '1D') {
        const activeTrading = getActiveTradingDay(now);
        const { startUTC } = getTaipeiSessionRange(activeTrading.year, activeTrading.month, activeTrading.day);
        startDate = startUTC;
      } else if (range === '1W') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (range === '1M') {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else if (range === '6M') {
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      } else if (range === 'YTD') {
        const tz = getTaipeiTime(now);
        // Jan 1st of current year in Taipei time
        startDate = new Date(Date.parse(`${tz.year}-01-01T00:00:00+08:00`));
      } else if (range === '1Y') {
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      } else if (range === '5Y') {
        startDate = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000);
      }
      
      whereClause.timestamp = {
        gte: startDate,
        lte: now
      };
    } else {
      if (period === '1m' || period === '5m') {
        whereClause.timestamp = {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        };
      }
    }

    // Query K-lines
    const records = await prisma.kLineHistory.findMany({
      where: whereClause,
      orderBy: { timestamp: 'asc' }
    });

    const filteredRecords = records.filter(r => {
      const tz = getTaipeiTime(r.timestamp);
      // Valid trading hours for K-lines are 19:00 - 24:00 (19:00 - 23:59 and exactly 00:00)
      const isValid = (tz.hour >= 19 && tz.hour <= 23) || (tz.hour === 0 && tz.minute === 0);
      return isValid;
    });

    const pts = filteredRecords.map(r => ({
      time: r.timestamp, // Date object
      open: r.open,
      high: r.high,
      low: r.low,
      close: r.close,
      volume: Number(r.volume)
    }));

    if (pts.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    let aggregated: any[] = [];
    
    if (range) {
      if (pts.length <= 300) {
        aggregated = pts.map(p => {
          const tz = getTaipeiTime(p.time);
          let timeLabel = '';
          if (range === '1D') {
            timeLabel = `${String(tz.hour).padStart(2, '0')}:${String(tz.minute).padStart(2, '0')}`;
          } else {
            timeLabel = `${String(tz.month).padStart(2, '0')}/${String(tz.day).padStart(2, '0')} ${String(tz.hour).padStart(2, '0')}:${String(tz.minute).padStart(2, '0')}`;
          }
          return {
            time: timeLabel,
            open: p.open,
            high: p.high,
            low: p.low,
            close: p.close,
            volume: p.volume
          };
        });
      } else {
        // Aggregate into exactly 300 buckets
        const bucketSize = pts.length / 300;
        for (let i = 0; i < 300; i++) {
          const startIdx = Math.floor(i * bucketSize);
          const endIdx = Math.min(pts.length, Math.floor((i + 1) * bucketSize));
          const group = pts.slice(startIdx, endIdx);
          if (group.length === 0) continue;
          
          const first = group[0];
          const last = group[group.length - 1];
          const open = first.open;
          const close = last.close;
          const high = Math.max(...group.map(x => x.high));
          const low = Math.min(...group.map(x => x.low));
          const volume = group.reduce((sum, x) => sum + x.volume, 0);
          
          const midPoint = group[Math.floor(group.length / 2)];
          const tz = getTaipeiTime(midPoint.time);
          
          let timeLabel = '';
          if (range === '1D') {
            timeLabel = `${String(tz.hour).padStart(2, '0')}:${String(tz.minute).padStart(2, '0')}`;
          } else if (range === '1W' || range === '1M') {
            timeLabel = `${String(tz.month).padStart(2, '0')}/${String(tz.day).padStart(2, '0')} ${String(tz.hour).padStart(2, '0')}:${String(tz.minute).padStart(2, '0')}`;
          } else {
            timeLabel = `${String(tz.year).substring(2)}/${String(tz.month).padStart(2, '0')}/${String(tz.day).padStart(2, '0')}`;
          }
          
          aggregated.push({
            time: timeLabel,
            open,
            high,
            low,
            close,
            volume
          });
        }
      }
      return NextResponse.json({ success: true, data: aggregated });
    }

    const today = getTaipeiTime(new Date());
    const todayDateStr = `${today.year}-${String(today.month).padStart(2, '0')}-${String(today.day).padStart(2, '0')}`;

    if (period === '1m') {
      aggregated = pts.map(p => {
        const tz = getTaipeiTime(p.time);
        const dateStr = `${tz.year}-${String(tz.month).padStart(2, '0')}-${String(tz.day).padStart(2, '0')}`;
        const timeStr = `${String(tz.hour).padStart(2, '0')}:${String(tz.minute).padStart(2, '0')}`;
        const timeLabel = dateStr === todayDateStr ? timeStr : `${String(tz.month).padStart(2, '0')}/${String(tz.day).padStart(2, '0')} ${timeStr}`;
        return {
          time: timeLabel,
          open: p.open,
          high: p.high,
          low: p.low,
          close: p.close,
          volume: p.volume
        };
      });
    } else if (period === '5m') {
      const grouped = new Map<string, typeof pts>();
      for (const p of pts) {
        const tz = getTaipeiTime(p.time);
        const roundedMin = Math.floor(tz.minute / 5) * 5;
        const key = `${tz.year}-${String(tz.month).padStart(2, '0')}-${String(tz.day).padStart(2, '0')} ${String(tz.hour).padStart(2, '0')}:${String(roundedMin).padStart(2, '0')}`;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(p);
      }

      aggregated = Array.from(grouped.entries()).map(([key, group]) => {
        const parts = key.split(' ');
        const dateStr = parts[0];
        const timeLabel = parts[1]; // HH:MM
        
        const open = group[0].open;
        const close = group[group.length - 1].close;
        const high = Math.max(...group.map(x => x.high));
        const low = Math.min(...group.map(x => x.low));
        const volume = group.reduce((sum, x) => sum + x.volume, 0);

        const label = dateStr === todayDateStr ? timeLabel : `${dateStr.substring(5).replace('-', '/')} ${timeLabel}`;

        return {
          time: label,
          open,
          high,
          low,
          close,
          volume
        };
      });
    } else if (period === '1D') {
      const grouped = new Map<string, typeof pts>();
      for (const p of pts) {
        const dateStr = getTaipeiDateString(p.time);
        if (!grouped.has(dateStr)) grouped.set(dateStr, []);
        grouped.get(dateStr)!.push(p);
      }

      aggregated = Array.from(grouped.entries()).map(([key, group]) => {
        // Format YYYY-MM-DD to MM/DD for X axis display
        const parts = key.split('-');
        const timeLabel = `${parts[1]}/${parts[2]}`;

        const open = group[0].open;
        const close = group[group.length - 1].close;
        const high = Math.max(...group.map(x => x.high));
        const low = Math.min(...group.map(x => x.low));
        const volume = group.reduce((sum, x) => sum + x.volume, 0);

        return {
          time: timeLabel,
          open,
          high,
          low,
          close,
          volume
        };
      });
    } else if (period === '1W') {
      const getWeekKey = (date: Date): string => {
        const tzDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }));
        const day = tzDate.getDay();
        const diff = tzDate.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(tzDate.setDate(diff));
        return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
      };

      const grouped = new Map<string, typeof pts>();
      for (const p of pts) {
        const key = getWeekKey(p.time);
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(p);
      }

      aggregated = Array.from(grouped.entries()).map(([key, group]) => {
        const parts = key.split('-');
        const timeLabel = `${parts[1]}/${parts[2]}`; // MM/DD

        const open = group[0].open;
        const close = group[group.length - 1].close;
        const high = Math.max(...group.map(x => x.high));
        const low = Math.min(...group.map(x => x.low));
        const volume = group.reduce((sum, x) => sum + x.volume, 0);

        return {
          time: timeLabel,
          open,
          high,
          low,
          close,
          volume
        };
      });
    } else if (period === '1M') {
      const grouped = new Map<string, typeof pts>();
      for (const p of pts) {
        const tz = getTaipeiTime(p.time);
        const key = `${tz.year}-${String(tz.month).padStart(2, '0')}`;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(p);
      }

      aggregated = Array.from(grouped.entries()).map(([key, group]) => {
        const parts = key.split('-');
        const timeLabel = `${parts[0]}/${parts[1]}`; // YYYY/MM

        const open = group[0].open;
        const close = group[group.length - 1].close;
        const high = Math.max(...group.map(x => x.high));
        const low = Math.min(...group.map(x => x.low));
        const volume = group.reduce((sum, x) => sum + x.volume, 0);

        return {
          time: timeLabel,
          open,
          high,
          low,
          close,
          volume
        };
      });
    }

    // Limit to the most recent 300 points to ensure snappy UI loading
    const sliced = aggregated.slice(-300);

    return NextResponse.json({ success: true, data: sliced });
  } catch (error) {
    console.error('Error in kline history aggregation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
