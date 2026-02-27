const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...\n');

  try {
    // Create demo admin user
    const adminEmail = 'admin@atlas.com';
    const adminPassword = 'admin123';
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        fullName: 'Atlas Admin',
        role: 'ADMIN',
        credits: 9999,
        subscriptionStatus: 'active',
        subscriptionPlan: 'enterprise',
        password: hashedPassword,
      },
      create: {
        id: 'f4b3c2a1-1234-5678-9abc-def012345678',
        email: adminEmail,
        password: hashedPassword,
        fullName: 'Atlas Admin',
        role: 'ADMIN',
        credits: 9999,
        subscriptionStatus: 'active',
        subscriptionPlan: 'enterprise',
      },
    });

    console.log('✅ Admin user created/updated:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Credits: ${admin.credits}`);
    console.log(`   Status: ${admin.subscriptionStatus}`);
    console.log();

    // Create a sample venture
    const venture = await prisma.venture.upsert({
      where: { id: 'demo-venture-001' },
      update: {},
      create: {
        id: 'demo-venture-001',
        name: 'Demo Venture',
        description: 'A sample venture for testing',
        industry: 'Technology',
        stage: 'startup',
        userId: admin.id,
      },
    });

    console.log('✅ Sample venture created:');
    console.log(`   Name: ${venture.name}`);
    console.log(`   Industry: ${venture.industry}`);
    console.log();

    console.log('🎉 Database seeding complete!');
    console.log();
    console.log('Login credentials:');
    console.log('   Email: admin@atlas.com');
    console.log('   Password: admin123');
    console.log();

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
