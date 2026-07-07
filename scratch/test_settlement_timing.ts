import { runDailyRolloverOrSettlement } from '../src/services/settlementService';
import { getPreviousSundayEndInTaipei, getNextSettlementBoundary } from '../src/utils/marketHours';

function testSettlementTiming() {
  console.log('Testing settlement timing and logical day mapping...');

  // Test case 1: Monday 23:59:00 (which rounds to logical Tuesday 00:00:00 early morning trigger)
  // Tuesday 2026-06-23 00:00:00 Taipei time -> logical day = Monday, should trigger settle
  const dateTueMidnight = new Date('2026-06-23T00:00:00+08:00');
  console.log('\nTue Midnight:', dateTueMidnight.toISOString());
  console.log('Previous Sunday End:', getPreviousSundayEndInTaipei(dateTueMidnight).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }));
  console.log('Next Settlement Boundary:', getNextSettlementBoundary(dateTueMidnight).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }));

  // Test case 2: Monday 00:00:00 Taipei time -> logical day = Sunday, should trigger none (rest day)
  const dateMonMidnight = new Date('2026-06-22T00:00:00+08:00');
  console.log('\nMon Midnight:', dateMonMidnight.toISOString());
  console.log('Previous Sunday End:', getPreviousSundayEndInTaipei(dateMonMidnight).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }));
  console.log('Next Settlement Boundary:', getNextSettlementBoundary(dateMonMidnight).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }));

  // Test case 3: Wednesday 00:00:00 Taipei time -> logical day = Tuesday, should trigger rollover
  const dateWedMidnight = new Date('2026-06-24T00:00:00+08:00');
  console.log('\nWed Midnight:', dateWedMidnight.toISOString());
  console.log('Previous Sunday End:', getPreviousSundayEndInTaipei(dateWedMidnight).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }));
  console.log('Next Settlement Boundary:', getNextSettlementBoundary(dateWedMidnight).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }));
}

testSettlementTiming();
