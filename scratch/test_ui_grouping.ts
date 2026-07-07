import { prisma } from '../src/lib/prisma';
import { ReviewStatus } from '../src/types/enums';

function tokenize(text: string): Set<string> {
  const clean = text
    .toLowerCase()
    .replace(/[【】\[\]\(\)#\s\-_★🔴🟢🟣✧]/g, ' ')
    .replace(/[^\w\s\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff]/g, ' '); // Keep chars, JP, and CN
  
  const skipWords = new Set(['ホロライブ', 'hololive', 'ch', 'channel', '配信', 'live', 'コラボ', '連動', '剪輯', '精華', '切り抜き']);
  const tokens = clean.split(/\s+/).filter(w => w.length > 1 && !skipWords.has(w));
  return new Set(tokens);
}

function getTitleSimilarity(title1: string, title2: string): number {
  const words1 = tokenize(title1);
  const words2 = tokenize(title2);
  if (words1.size === 0 || words2.size === 0) return 0;

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  return intersection.size / union.size;
}

function hasSharedLongToken(title1: string, title2: string): boolean {
  const words1 = tokenize(title1);
  const words2 = tokenize(title2);
  for (const w1 of words1) {
    if (w1.length >= 3 && words2.has(w1)) {
      return true;
    }
  }
  return false;
}

async function main() {
  const pendingEvents = await prisma.teeteeEvents.findMany({
    where: { status: ReviewStatus.PENDING },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`Pending events found: ${pendingEvents.length}`);
  
  interface PendingEventGroup {
    isDuplicateGroup: boolean;
    events: typeof pendingEvents;
  }
  
  const groups: PendingEventGroup[] = [];
  const processedIds = new Set<string>();

  for (let i = 0; i < pendingEvents.length; i++) {
    const evt = pendingEvents[i];
    if (processedIds.has(evt.id)) continue;

    const groupEvents = [evt];
    processedIds.add(evt.id);

    for (let j = i + 1; j < pendingEvents.length; j++) {
      const other = pendingEvents[j];
      if (processedIds.has(other.id)) continue;

      if (other.pairId === evt.pairId) {
        const timeDiff = Math.abs(evt.createdAt.getTime() - other.createdAt.getTime());
        if (timeDiff < 12 * 60 * 60 * 1000) { // 12 hours
          const similarity = getTitleSimilarity(evt.title, other.title);
          const hasSharedLong = hasSharedLongToken(evt.title, other.title);
          if (similarity >= 0.15 || hasSharedLong) {
            groupEvents.push(other);
            processedIds.add(other.id);
          }
        }
      }
    }

    groups.push({
      isDuplicateGroup: groupEvents.length > 1,
      events: groupEvents
    });
  }

  console.log(`Created ${groups.length} groups:`);
  groups.forEach((g, idx) => {
    console.log(`Group ${idx + 1} (Duplicate: ${g.isDuplicateGroup}, Size: ${g.events.length}):`);
    g.events.forEach(e => {
      console.log(`  - [${e.pairId}] ${e.title} (${e.url})`);
    });
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
