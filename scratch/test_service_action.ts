import { runDailyRolloverOrSettlement } from '../src/services/settlementService';

async function testServiceAction() {
  console.log('Testing runDailyRolloverOrSettlement action selection...');

  // Tuesday 00:00:00 Taipei time (which corresponds to Monday night end)
  // Action should be 'settle'
  const tueMidnight = new Date('2026-06-23T00:00:00+08:00');
  const resTue = await runDailyRolloverOrSettlement({ targetDate: tueMidnight, forceAction: undefined });
  console.log(`Tuesday 00:00:00: action=${resTue.actionExecuted}, message=${resTue.message}`);

  // Monday 00:00:00 Taipei time (which corresponds to Sunday night end)
  // Action should be 'none' (rest day)
  const monMidnight = new Date('2026-06-22T00:00:00+08:00');
  const resMon = await runDailyRolloverOrSettlement({ targetDate: monMidnight, forceAction: undefined });
  console.log(`Monday 00:00:00: action=${resMon.actionExecuted}, message=${resMon.message}`);

  // Wednesday 00:00:00 Taipei time (which corresponds to Tuesday night end)
  // Action should be 'rollover'
  const wedMidnight = new Date('2026-06-24T00:00:00+08:00');
  const resWed = await runDailyRolloverOrSettlement({ targetDate: wedMidnight, forceAction: undefined });
  console.log(`Wednesday 00:00:00: action=${resWed.actionExecuted}, message=${resWed.message}`);
}

testServiceAction()
  .catch(console.error);
