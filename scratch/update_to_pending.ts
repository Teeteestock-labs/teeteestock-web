import { prisma } from '../src/lib/prisma';
import { ReviewStatus } from '../src/types/enums';

async function main() {
  await prisma.teeteeEvents.updateMany({
    where: { url: 'https://www.youtube.com/watch?v=u3GROap_mCU' },
    data: { status: ReviewStatus.PENDING }
  });

  await prisma.teeteeEvents.updateMany({
    where: { url: 'https://www.youtube.com/watch?v=pV8N1grlSSc_test' },
    data: { status: ReviewStatus.PENDING }
  });

  console.log('Successfully set both chameleon events to PENDING');
}

main().catch(console.error).finally(() => prisma.$disconnect());
