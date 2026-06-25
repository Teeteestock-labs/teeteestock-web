import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_PAIRS } from '@/app/constants/market';
import { getTaipeiTime } from '@/utils/marketHours';

function getActiveTradingDay(date: Date = new Date()) {
  let check = new Date(date.getTime());
  for (let i = 0; i < 10; i++) {
    const t = getTaipeiTime(check);
    const isTradingDay = t.dayOfWeek !== 1; // Tue to Sun
    if (isTradingDay) {
      if (i === 0) {
        if (t.hour >= 18) {
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

function getTaipeiSessionRange(year: number, month: number, day: number) {
  const startUTC = new Date(Date.UTC(year, month - 1, day, 10, 0, 0));
  const endUTC = new Date(Date.UTC(year, month - 1, day, 16, 0, 0));
  return { startUTC, endUTC };
}

export async function GET() {
  try {
    const now = new Date();
    const activeTrading = getActiveTradingDay(now);
    const { startUTC, endUTC } = getTaipeiSessionRange(activeTrading.year, activeTrading.month, activeTrading.day);

    const pairs = await prisma.cpPairs.findMany({
      include: {
        klineHistory: {
          where: {
            timestamp: {
              gte: startUTC,
              lte: endUTC
            }
          },
          orderBy: {
            timestamp: 'asc'
          }
        },
        trades: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 50
        },
        events: {
          where: {
            status: 'APPROVED'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 20
        }
      }
    });

    const today = getTaipeiTime(now);
    const todayDateStr = `${today.year}-${String(today.month).padStart(2, '0')}-${String(today.day).padStart(2, '0')}`;
    
    let maxAllowedIndex = 359;
    if (activeTrading.dateStr === todayDateStr) {
      let currentMinutesSince18 = 0;
      if (today.hour >= 18) {
        currentMinutesSince18 = (today.hour - 18) * 60 + today.minute;
      } else {
        currentMinutesSince18 = (today.hour + 6) * 60 + today.minute;
      }
      maxAllowedIndex = Math.min(359, Math.max(0, currentMinutesSince18));
    }

    const mappedPairs = pairs.map(p => {
      // Aggregate 1-minute K-lines into 360 1-minute buckets
      const chartPoints = new Array(360).fill(null);

      p.klineHistory.forEach(h => {
        const date = new Date(h.timestamp);
        
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Taipei',
          hour: 'numeric',
          minute: 'numeric',
          hour12: false
        });
        const parts = formatter.formatToParts(date);
        let hour = parseInt(parts.find(x => x.type === 'hour')?.value || '18', 10);
        const minute = parseInt(parts.find(x => x.type === 'minute')?.value || '0', 10);

        if (hour === 24) hour = 0;
        
        let minutesSince18 = 0;
        if (hour >= 18) {
          minutesSince18 = (hour - 18) * 60 + minute;
        } else {
          minutesSince18 = (hour + 6) * 60 + minute;
        }
        
        let index = minutesSince18;
        if (index >= 360) index = 359;
        if (index < 0) index = 0;

        chartPoints[index] = {
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          open: h.open,
          high: h.high,
          low: h.low,
          close: h.close,
          volume: Number(h.volume)
        };
      });

      // Fill vacuum gaps and truncate future points
      let lastValidPrice = p.openingPrice;
      const history = chartPoints.map((pt, idx) => {
        if (idx <= maxAllowedIndex) {
          if (pt === null) {
            const bucketMin = 18 * 60 + idx;
            const h = Math.floor(bucketMin / 60) % 24;
            const m = bucketMin % 60;
            return {
              time: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
              open: lastValidPrice,
              high: lastValidPrice,
              low: lastValidPrice,
              close: lastValidPrice,
              volume: 0
            };
          } else {
            lastValidPrice = pt.close;
            return pt;
          }
        } else {
          return null;
        }
      });

      // Map recentTrades
      const recentTrades = p.trades.map((t, idx) => {
        const date = new Date(t.createdAt);
        const time = date.toLocaleTimeString('en-US', { 
          timeZone: 'Asia/Taipei',
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        });
        
        const nextTrade = p.trades[idx + 1];
        const prevPrice = nextTrade ? nextTrade.price : p.openingPrice;
        const isUp = t.price >= prevPrice;
        
        return {
          time,
          price: t.price,
          amount: t.volume,
          isUp
        };
      });

      // Map teeteeNews from database events
      const dbNews = p.events.map(event => {
        const date = new Date(event.createdAt);
        const time = date.toLocaleDateString('zh-TW', { 
          timeZone: 'Asia/Taipei',
          month: '2-digit', 
          day: '2-digit' 
        });
        
        let typeLabel = "日常連動";
        let percentStr = "9%";
        if (event.type === 'VIDEO') {
          typeLabel = "新曲/MV";
          percentStr = "30%";
        } else if (event.type === 'STREAM_3D') {
          typeLabel = "大型/3D";
          percentStr = "15%";
        }

        const formattedTitle = `${event.pairId} [${typeLabel}] (${percentStr}) - 理由：${event.reason || '無'}`;

        return {
          id: event.id,
          type: event.type === 'VIDEO' ? 'new_song' : event.type === 'STREAM_3D' ? 'large_event' : 'live_collab',
          content: formattedTitle,
          link: event.url,
          time
        };
      });

      const initialPair = INITIAL_PAIRS.find(x => x.id === p.id);
      const fallbackNews = (initialPair?.teeteeNews || []).map(news => {
        const now = new Date();
        const time = now.toLocaleDateString('zh-TW', {
          timeZone: 'Asia/Taipei',
          month: '2-digit',
          day: '2-digit'
        });
        return {
          ...news,
          time
        };
      });
      const teeteeNews = dbNews.length > 0 ? dbNews : fallbackNews;

      const todayVolume = p.trades.reduce((sum, t) => sum + t.volume, 0);

      return {
        id: p.id,
        price: p.currentPrice,
        openingPrice: p.openingPrice,
        yesterdayPrice: p.openingPrice,
        status: p.status,
        warningWeeks: p.warningWeeks,
        todayVolume,
        history,
        recentTrades,
        teeteeNews,
      };
    });

    // Query pending orders from OrderBook table
    const dbOrders = await prisma.orderBook.findMany();
    const mappedOrders = dbOrders.map(o => ({
      id: o.id,
      pairId: o.pairId,
      type: o.side.toLowerCase() as 'buy' | 'sell',
      price: o.price,
      amount: o.volume,
      isUser: o.userId === 'default_player',
      botId: o.userId !== 'default_player' ? o.userId : undefined,
      timestamp: o.createdAt.getTime()
    }));

    return NextResponse.json({ 
      success: true, 
      pairs: mappedPairs,
      orders: mappedOrders
    });
  } catch (error) {
    console.error('Error fetching market list:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
