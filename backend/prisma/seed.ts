import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@atlas.com';
  const password = 'admin123';
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);

  // Use a consistent ID that matches the mock user fallback in get-user.decorator.ts
  const ADMIN_USER_ID = 'f4b3c2a1-1234-5678-9abc-def012345678';

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      // Update existing user to have admin privileges
      fullName: 'Atlas Admin',
      role: 'ADMIN',
      credits: 999,
      subscriptionStatus: 'active',
      subscriptionPlan: 'enterprise',
    },
    create: {
      id: ADMIN_USER_ID,
      email,
      password: hashedPassword,
      fullName: 'Atlas Admin',
      role: 'ADMIN',
      credits: 999,
      subscriptionStatus: 'active',
      subscriptionPlan: 'enterprise',
    },
  });

  console.log({ user });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
