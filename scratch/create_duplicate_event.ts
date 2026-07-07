import { prisma } from '../src/lib/prisma';
import { EventType, ReviewStatus } from '../src/types/enums';

async function main() {
  const url = 'https://www.youtube.com/watch?v=pV8N1grlSSc_test';
  console.log(`Inserting duplicate test event...`);

  const event = await prisma.teeteeEvents.create({
    data: {
      pairId: 'OKKR',
      url,
      type: EventType.STREAM,
      title: '【 🟢めっちゃカメレオン 】体に絵を描いて擬態するかくれんぼ⁉️【 猫又おかゆ視点/ホロライブ 】',
      reporter: 'CRAWLER',
      status: ReviewStatus.PENDING
    }
  });

  console.log(`Successfully created duplicate event with ID: ${event.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
