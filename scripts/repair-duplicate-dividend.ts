import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DuplicatePairInfo {
  pairId: string;
  firstLog: {
    id: string;
    createdAt: Date;
    previousNV: number;
    newNV: number;
    dividendPerShare: number;
    previousPrice: number;
    newPrice: number;
  };
  dupLog: {
    id: string;
    createdAt: Date;
    previousNV: number;
    newNV: number;
    dividendPerShare: number;
    previousPrice: number;
    newPrice: number;
  };
  hasTradesAfter: boolean;
}

interface DuplicateUserPayout {
  userId: string;
  excessPayout: number;
  logIds: string[];
}

async function main() {
  const args = process.argv.slice(2);
  const isApply = args.includes('--apply');

  console.log('================================================================');
  console.log('       TeeTeeStock 雙重除息智慧診斷與資料修復工具 (Repair Tool)    ');
  console.log('================================================================');
  console.log(`執行模式: ${isApply ? '【正式修復模式 (APPLY)】⚠️ 將直接寫入資料庫' : '【預檢預覽模式 (DRY-RUN)】ℹ️ 僅檢視，不變更資料庫'}\n`);

  // 1. 抓取過去 7 天內的所有 SettlementLog
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const settlementLogs = await prisma.settlementLog.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    orderBy: { createdAt: 'asc' }
  });

  if (settlementLogs.length === 0) {
    console.log('ℹ️ 過去 7 天內未找到任何結算日誌 (SettlementLog)。');
    return;
  }

  // 2. 依 pairId 分組並偵測 15 分鐘內的重複結算
  const logsByPair = new Map<string, typeof settlementLogs>();
  for (const log of settlementLogs) {
    const list = logsByPair.get(log.pairId) || [];
    list.push(log);
    logsByPair.set(log.pairId, list);
  }

  const duplicates: DuplicatePairInfo[] = [];

  for (const [pairId, logs] of logsByPair.entries()) {
    if (logs.length < 2) continue;

    // 檢查是否有兩筆結算時間差距小於 15 分鐘
    for (let i = 0; i < logs.length - 1; i++) {
      const first = logs[i];
      const second = logs[i + 1];
      const diffMinutes = (second.createdAt.getTime() - first.createdAt.getTime()) / (1000 * 60);

      if (diffMinutes >= 0 && diffMinutes <= 15) {
        // 檢查在第二筆結算後是否有新成交紀錄
        const tradeCount = await prisma.trades.count({
          where: {
            pairId,
            createdAt: { gte: second.createdAt }
          }
        });

        duplicates.push({
          pairId,
          firstLog: {
            id: first.id,
            createdAt: first.createdAt,
            previousNV: first.previousNV,
            newNV: first.newNV,
            dividendPerShare: first.dividendPerShare,
            previousPrice: first.previousPrice,
            newPrice: first.newPrice
          },
          dupLog: {
            id: second.id,
            createdAt: second.createdAt,
            previousNV: second.previousNV,
            newNV: second.newNV,
            dividendPerShare: second.dividendPerShare,
            previousPrice: second.previousPrice,
            newPrice: second.newPrice
          },
          hasTradesAfter: tradeCount > 0
        });
        break;
      }
    }
  }

  if (duplicates.length === 0) {
    console.log('✅ 未偵測到任何 15 分鐘內發生的重複除息結算記錄。資料庫狀態正常！');
    return;
  }

  console.log(`⚠️ 偵測到 ${duplicates.length} 對 CP 組合存在雙重除息現象：\n`);

  // 表格展示受影響交易對
  console.log('┌──────────────┬─────────────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐');
  console.log('│ 組合代碼     │ 第一次結算時間      │ 正確淨值(1st)│ 第二次淨值   │ 正確股價(1st)│ 第二次股價   │ 後續有成交？ │');
  console.log('├──────────────┼─────────────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤');
  for (const d of duplicates) {
    const t = d.firstLog.createdAt.toISOString().replace('T', ' ').substring(0, 19);
    console.log(
      `│ ${d.pairId.padEnd(12)} │ ${t} │ ${d.firstLog.newNV.toFixed(2).padStart(12)} │ ${d.dupLog.newNV.toFixed(2).padStart(12)} │ ${d.firstLog.newPrice.toFixed(2).padStart(12)} │ ${d.dupLog.newPrice.toFixed(2).padStart(12)} │ ${(d.hasTradesAfter ? '是 (保留市價)' : '否 (還原價格)').padEnd(12)} │`
    );
  }
  console.log('└──────────────┴─────────────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘\n');

  // 3. 搜尋重複發放的 UserDividendLog
  const dupSettlementLogIds = duplicates.map(d => d.dupLog.id);
  const dupPairIds = duplicates.map(d => d.pairId);

  // 取得第二批結算的最小與最大時間窗口 (+- 3 分鐘)
  const dupTimes = duplicates.map(d => d.dupLog.createdAt.getTime());
  const minDupTime = new Date(Math.min(...dupTimes) - 3 * 60 * 1000);
  const maxDupTime = new Date(Math.max(...dupTimes) + 3 * 60 * 1000);

  const duplicateDividendLogs = await prisma.userDividendLog.findMany({
    where: {
      pairId: { in: dupPairIds },
      createdAt: {
        gte: minDupTime,
        lte: maxDupTime
      }
    }
  });

  // 彙整每位用戶多拿到的股利
  const userPayoutMap = new Map<string, { total: number; logIds: string[] }>();
  for (const log of duplicateDividendLogs) {
    const current = userPayoutMap.get(log.userId) || { total: 0, logIds: [] };
    current.total += log.totalPayout;
    current.logIds.push(log.id);
    userPayoutMap.set(log.userId, current);
  }

  const userPayouts: DuplicateUserPayout[] = [];
  for (const [userId, info] of userPayoutMap.entries()) {
    userPayouts.push({
      userId,
      excessPayout: Math.round(info.total * 100) / 100,
      logIds: info.logIds
    });
  }

  console.log(`👥 受影響玩家總數: ${userPayouts.length} 人，重複股利記錄共 ${duplicateDividendLogs.length} 筆`);
  if (userPayouts.length > 0) {
    console.log('玩家獲得多發股利明細（依指示全數保留，不扣回用戶餘額）:');
    console.table(
      userPayouts.slice(0, 15).map(u => ({
        用戶ID: u.userId,
        保留之多發金額: u.excessPayout,
        重複筆數: u.logIds.length
      }))
    );
    const totalExcess = userPayouts.reduce((sum, u) => sum + u.excessPayout, 0);
    console.log(`💰 全市場多發放之福利總額: ${totalExcess.toFixed(2)} TEE (不追回)\n`);
  }

  // 4. 若為 DRY-RUN 模式，僅提示說明
  if (!isApply) {
    console.log('----------------------------------------------------------------');
    console.log('💡 以上為預檢結果，尚未對資料庫進行任何修改。');
    console.log('👉 若確認無誤，請執行以下指令套用修復：');
    console.log('   npx ts-node scripts/repair-duplicate-dividend.ts --apply');
    console.log('----------------------------------------------------------------');
    return;
  }

  console.log('⏳ 正在啟動資料庫事務進行修復...');
  console.log('🎁 依指示：不扣回玩家重複發放的股利（全數作為玩家福利保留，不扣除餘額）。');

  await prisma.$transaction(async (tx) => {
    // 1. 不扣回用戶資金（保留給玩家福利）
    console.log(`ℹ️ 跳過用戶餘額扣回，${userPayouts.length} 位用戶的雙重股利已全數保留。`);

    // 2. 刪除重複的 UserDividendLog
    const allDupDivLogIds = userPayouts.flatMap(u => u.logIds);
    if (allDupDivLogIds.length > 0) {
      const delDivCount = await tx.userDividendLog.deleteMany({
        where: { id: { in: allDupDivLogIds } }
      });
      console.log(`✅ 已刪除 ${delDivCount.count} 筆重複的 UserDividendLog。`);
    }

    // 3. 刪除第二次重複的 SettlementLog
    const delSettleCount = await tx.settlementLog.deleteMany({
      where: { id: { in: dupSettlementLogIds } }
    });
    console.log(`✅ 已刪除 ${delSettleCount.count} 筆重複的 SettlementLog。`);

    // 4. 還原各 CP Pair 的淨值與股價至第一次除息結算的正確數值
    for (const d of duplicates) {
      const pair = await tx.cpPairs.findUnique({ where: { id: d.pairId } });
      if (!pair) continue;

      const updateData: any = {
        netValue: d.firstLog.newNV,
        lastSettledAt: d.firstLog.createdAt
      };

      // 若結算後無新成交，同時還原股價與開盤參考價；若已有新撮合成交，則保留最新市價但更新淨值
      if (!d.hasTradesAfter) {
        updateData.currentPrice = d.firstLog.newPrice;
        updateData.openingPrice = d.firstLog.newPrice;
        updateData.last_close_price = d.firstLog.previousPrice;
        updateData.next_open_price = d.firstLog.newPrice;
      }

      await tx.cpPairs.update({
        where: { id: d.pairId },
        data: updateData
      });
    }
    console.log(`✅ 已完成 ${duplicates.length} 對 CP 組合的淨值與價格還原至正確第一次除息數值。`);

    // 5. 確保 SystemConfig 狀態正常
    await tx.systemConfig.update({
      where: { id: 1 },
      data: {
        pendingDividendSettle: false,
        lastDividendTriggeredAt: null
      }
    });
    console.log('✅ 已重置 SystemConfig 結算預約標記。');
  }, { timeout: 30000 });

  console.log('\n🎉 所有雙重除息異常資料已成功修復完成！資料庫已回復一致狀態。');
}

main()
  .catch((err) => {
    console.error('❌ 修復過程中發生錯誤:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
