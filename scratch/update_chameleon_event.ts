import { prisma } from '../src/lib/prisma';
import { ReviewStatus } from '../src/types/enums';

async function main() {
  const url = 'https://www.youtube.com/watch?v=u3GROap_mCU';
  console.log(`Searching for event with URL: ${url}`);
  
  const event = await prisma.teeteeEvents.findFirst({
    where: { url }
  });

  if (!event) {
    console.error('Event not found in database!');
    return;
  }

  console.log(`Found event. Current status: ${event.status}`);
  
  const updated = await prisma.teeteeEvents.update({
    where: { id: event.id },
    data: { status: ReviewStatus.PENDING }
  });

  console.log(`Event updated successfully! New status: ${updated.status}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
