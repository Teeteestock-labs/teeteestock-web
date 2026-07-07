import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
const MATCHING_API_URL = `${BASE_URL}/api/matching`;

async function triggerMatching() {
  console.log(`[${new Date().toISOString()}] Triggering matching engine at ${MATCHING_API_URL}...`);
  try {
    const response = await fetch(MATCHING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[${new Date().toISOString()}] Matching API failed (Status ${response.status}):`, errText);
      return false;
    }

    const data = await response.json();
    if (data.success) {
      console.log(`[${new Date().toISOString()}] Matching completed successfully:`);
      console.log(JSON.stringify(data.results, null, 2));
    } else {
      console.error(`[${new Date().toISOString()}] Matching API returned error:`, data.error || data.message || 'Unknown error', data.details || '');
    }
    return data.success;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to call Matching API:`, error);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const runOnce = args.includes('--once');

  if (runOnce) {
    console.log("Running matching engine once...");
    const success = await triggerMatching();
    process.exit(success ? 0 : 1);
  } else {
    console.log(`Starting matching daemon. Will trigger every 3 seconds...`);
    async function runLoop() {
      await triggerMatching();
      setTimeout(runLoop, 3000);
    }
    await runLoop();
  }
}

main().catch(err => {
  console.error("Fatal daemon error:", err);
  process.exit(1);
});
