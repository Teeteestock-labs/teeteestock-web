import { runPoll } from '../src/cron/crawler';

async function main() {
  console.log('Running runPoll directly to inspect errors...');
  try {
    const result = await runPoll();
    console.log('runPoll completed successfully!', result);
  } catch (error) {
    console.error('runPoll failed with error:');
    console.error(error);
  }
}

main();
