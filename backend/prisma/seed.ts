import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Admin user (legacy: admin@atlas.com) ─────────────────────────────────
  const adminPasswordHash = await bcrypt.hash('Admin123!', SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@atlas.com' },
    update: {
      password: adminPasswordHash,
      fullName: 'Atlas Admin',
      role: 'ADMIN',
      credits: 9999,
      subscriptionStatus: 'active',
      subscriptionPlan: 'enterprise',
    },
    create: {
      id: 'f4b3c2a1-1234-5678-9abc-def012345678',
      email: 'admin@atlas.com',
      password: adminPasswordHash,
      fullName: 'Atlas Admin',
      role: 'ADMIN',
      credits: 9999,
      subscriptionStatus: 'active',
      subscriptionPlan: 'enterprise',
    },
  });
  console.log(`✅ Admin user (legacy): ${admin.email}`);

  // ─── Admin user (primary: admin@atlas.ai) ─────────────────────────────────
  const adminAiHash = await bcrypt.hash('Admin123!', SALT_ROUNDS);

  const adminAi = await prisma.user.upsert({
    where: { email: 'admin@atlas.ai' },
    update: {
      password: adminAiHash,
      fullName: 'Atlas AI Admin',
      role: 'ADMIN',
      credits: 9999,
      subscriptionStatus: 'active',
      subscriptionPlan: 'enterprise',
    },
    create: {
      email: 'admin@atlas.ai',
      password: adminAiHash,
      fullName: 'Atlas AI Admin',
      role: 'ADMIN',
      credits: 9999,
      subscriptionStatus: 'active',
      subscriptionPlan: 'enterprise',
    },
  });
  console.log(`✅ Admin user (primary): ${adminAi.email}`);

  // ─── Demo user (read-only demo access) ────────────────────────────────────
  const demoHash = await bcrypt.hash('Demo123!', SALT_ROUNDS);

  const demo = await prisma.user.upsert({
    where: { email: 'demo@atlas.ai' },
    update: {
      password: demoHash,
      fullName: 'Demo User',
      role: 'USER',
      credits: 100,
      subscriptionStatus: 'active',
      subscriptionPlan: 'pro',
    },
    create: {
      email: 'demo@atlas.ai',
      password: demoHash,
      fullName: 'Demo User',
      role: 'USER',
      credits: 100,
      subscriptionStatus: 'active',
      subscriptionPlan: 'pro',
    },
  });
  console.log(`✅ Demo user: ${demo.email}`);

  console.log('\n🎉 Seeding complete!');
  console.log('');
  console.log('Seeded accounts:');
  console.log('  admin@atlas.ai   / Admin123!  (ADMIN, enterprise)');
  console.log('  admin@atlas.com  / Admin123!  (ADMIN, enterprise)');
  console.log('  demo@atlas.ai    / Demo123!   (USER, pro)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
