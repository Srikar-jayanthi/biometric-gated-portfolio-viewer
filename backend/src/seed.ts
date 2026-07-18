import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const submissionPath = path.resolve(__dirname, '../../submission.json');
  if (!fs.existsSync(submissionPath)) {
    console.error(`submission.json not found at ${submissionPath}`);
    process.exit(1);
  }

  const submissionContent = JSON.parse(fs.readFileSync(submissionPath, 'utf8'));
  const testUserConfig = submissionContent.testUser;

  if (!testUserConfig || !testUserConfig.email || !testUserConfig.password) {
    console.error('Invalid submission.json format');
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(testUserConfig.password, 10);

  const user = await prisma.user.upsert({
    where: { email: testUserConfig.email },
    update: { password: hashedPassword },
    create: {
      email: testUserConfig.email,
      password: hashedPassword,
    },
  });

  console.log(`Test user seeded: ${user.email} (ID: ${user.id})`);

  const initialHoldings = [
    { ticker: 'AAPL', shareCount: 10, purchasePrice: 150.0 },
    { ticker: 'GOOGL', shareCount: 5, purchasePrice: 2800.0 },
    { ticker: 'MSFT', shareCount: 8, purchasePrice: 300.0 },
  ];

  for (const h of initialHoldings) {
    const existingHolding = await prisma.holding.findFirst({
      where: { userId: user.id, ticker: h.ticker },
    });

    if (!existingHolding) {
      await prisma.holding.create({
        data: {
          ticker: h.ticker,
          shareCount: h.shareCount,
          purchasePrice: h.purchasePrice,
          userId: user.id,
        },
      });
      console.log(`Holding ${h.ticker} created for user.`);
    }
  }

  console.log('Database seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
