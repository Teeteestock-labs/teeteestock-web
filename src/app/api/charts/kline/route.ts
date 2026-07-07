import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTaipeiTime, getTaipeiDateString } from '@/utils/marketHours';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id') || url.searchParams.get('pairId');
    const period = url.searchParams.get('period') || '1m';

    if (!id) {
      return NextResponse.json({ error: 'Missing pair id parameter' }, { status: 400 });
    }

    const pairId = id.toUpperCase();

    // Query all 1-minute K-lines for this pair ordered by timestamp ascending
    const records = await prisma.kLineHistory.findMany({
      where: { pairId },
      orderBy: { timestamp: 'asc' }
    });

    const filteredRecords = records.filter(r => {
      const tz = getTaipeiTime(r.timestamp);
      if (tz.hour === 18 && tz.minute >= 45) {
        return false;
      }
      return true;
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

    if (period === '1m') {
      aggregated = pts.map(p => {
        const tz = getTaipeiTime(p.time);
        const timeStr = `${String(tz.hour).padStart(2, '0')}:${String(tz.minute).padStart(2, '0')}`;
        return {
          time: timeStr,
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
        const timeLabel = parts[1]; // HH:MM
        
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
