const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();

  try {
    // Get all users
    const users = await prisma.user.findMany();
    console.log('\n=== Current Users ===');
    users.forEach((u) => {
      console.log(
        `- ${u.email}: ${u.credits} credits, role: ${u.role}, status: ${u.subscriptionStatus}`
      );
    });

    // Reset all users to 999 credits
    const result = await prisma.user.updateMany({
      data: { credits: 999 },
    });
    console.log(`\n✅ Reset ${result.count} users to 999 credits`);

    // Verify
    const updated = await prisma.user.findMany();
    console.log('\n=== Updated Users ===');
    updated.forEach((u) => {
      console.log(`- ${u.email}: ${u.credits} credits`);
    });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
