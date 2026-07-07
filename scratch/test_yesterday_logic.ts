import { isYesterdayInTaipei } from '../src/cron/crawler';

function runTests() {
  console.log('Running isYesterdayInTaipei tests...');

  // Mock execution date: Tuesday 2026-06-23 01:30:00 Taipei Time
  // Monday 2026-06-22 is yesterday
  const execDate = new Date('2026-06-23T01:30:00+08:00');

  // Test cases:
  const testCases = [
    {
      input: '2026-06-22T12:00:00Z', // Monday 20:00:00 Taipei time
      expected: true,
      desc: 'Monday stream within yesterday'
    },
    {
      input: '2026-06-22T00:00:00+08:00', // Monday 00:00:00 Taipei time
      expected: true,
      desc: 'Exactly start of Monday Taipei'
    },
    {
      input: '2026-06-22T23:59:59+08:00', // Monday 23:59:59 Taipei time
      expected: true,
      desc: 'Exactly end of Monday Taipei'
    },
    {
      input: '2026-06-21T23:59:59+08:00', // Sunday 23:59:59 Taipei time
      expected: false,
      desc: 'Sunday stream (too early)'
    },
    {
      input: '2026-06-23T00:00:00+08:00', // Tuesday 00:00:00 Taipei time
      expected: false,
      desc: 'Tuesday stream (too late)'
    }
  ];

  for (const tc of testCases) {
    const result = isYesterdayInTaipei(tc.input, execDate);
    if (result === tc.expected) {
      console.log(`[PASS] ${tc.desc}: input=${tc.input}`);
    } else {
      console.error(`[FAIL] ${tc.desc}: input=${tc.input}, expected=${tc.expected}, got=${result}`);
    }
  }
}

runTests();
