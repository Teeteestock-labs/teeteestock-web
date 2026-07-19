import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_PAIRS } from '@/app/constants/market';
import { getTaipeiTime, getActiveTradingDay, getTaipeiSessionRange } from '@/utils/marketHours';
import { checkAndTickMarketStatus } from '@/services/settlementService';


export async function GET() {
  try {
    const now = new Date();
    const marketStatus = await checkAndTickMarketStatus(now);
    const activeTrading = getActiveTradingDay(now);
    const { startUTC, endUTC } = getTaipeiSessionRange(activeTrading.year, activeTrading.month, activeTrading.day);

    const pairs = await prisma.cpPairs.findMany({
      where: {
        id: { not: 'hololive' }
      },
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
    
    let maxAllowedIndex = 299;
    if (activeTrading.dateStr === todayDateStr) {
      if (marketStatus === 'PRE_MARKET') {
        maxAllowedIndex = 0;
      } else {
        let currentMinutes = 0;
        if (today.hour >= 19) {
          currentMinutes = (today.hour - 19) * 60 + today.minute;
        } else {
          currentMinutes = 0;
        }
        maxAllowedIndex = Math.min(299, Math.max(0, currentMinutes));
      }
    }

    const mappedPairs = pairs.map(p => {
      // Aggregate 1-minute K-lines into 300 1-minute buckets (19:00 to 24:00)
      const chartPoints = new Array(300).fill(null);

      p.klineHistory.forEach(h => {
        const date = new Date(h.timestamp);
        
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Taipei',
          hour: 'numeric',
          minute: 'numeric',
          hour12: false
        });
        const parts = formatter.formatToParts(date);
        let hour = parseInt(parts.find(x => x.type === 'hour')?.value || '19', 10);
        const minute = parseInt(parts.find(x => x.type === 'minute')?.value || '0', 10);

        if (hour === 24) hour = 0;
        if (hour < 19 && hour !== 0) {
          return; // Ignore K-lines outside 19:00 - 24:00 Taipei time
        }
        
        let minutesSince1900 = -1;
        if (hour >= 19) {
          minutesSince1900 = (hour - 19) * 60 + minute;
        } else if (hour < 19) {
          minutesSince1900 = (hour + 5) * 60 + minute;
        }
        
        let index = minutesSince1900;
        if (index >= 300) index = 299;
        
        if (index >= 0) {
          chartPoints[index] = {
            time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
            open: h.open,
            high: h.high,
            low: h.low,
            close: h.close,
            volume: Number(h.volume)
          };
        }
      });

      // Fill vacuum gaps and truncate future points
      let lastValidPrice = p.openingPrice;
      const history = chartPoints.map((pt, idx) => {
        if (idx <= maxAllowedIndex) {
          if (pt === null) {
            const bucketMin = 19 * 60 + idx;
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
      }).filter((pt: any) => pt !== null);

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
          isUp,
          buyerId: t.buyerId,
          sellerId: t.sellerId
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
        
        let _typeLabel = "日常連動";
        let _percentStr = "9%";
        if (event.type === 'VIDEO') {
          _typeLabel = "新曲/MV";
          _percentStr = "30%";
        } else if (event.type === 'STREAM_3D') {
          _typeLabel = "大型/3D";
          _percentStr = "15%";
        }

        const formattedTitle = `[${event.pairId}] ${event.title}`;

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

      const todayVolume = p.klineHistory.reduce((sum, h) => sum + Number(h.volume), 0);

      let todayOpenPrice = p.todayOpenPrice;
      if (todayOpenPrice === null) {
        const firstKLineWithVolume = p.klineHistory.find(h => Number(h.volume) > 0);
        if (firstKLineWithVolume) {
          todayOpenPrice = firstKLineWithVolume.close;
        }
      }

      return {
        id: p.id,
        name: p.name,
        price: p.currentPrice,
        openingPrice: p.openingPrice,
        todayOpenPrice,
        yesterdayPrice: p.last_close_price,
        change24h: p.openingPrice !== 0 ? ((p.currentPrice - p.openingPrice) / p.openingPrice) * 100 : 0,
        netValue: p.netValue,
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
      orders: mappedOrders,
      marketStatus
    });
  } catch (error) {
    console.error('Error fetching market list:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
