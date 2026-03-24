const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetAdminCredits() {
  try {
    // Find all admin users
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      }
    });

    console.log(`Found ${adminUsers.length} admin user(s):`);
    
    for (const user of adminUsers) {
      console.log(`- ${user.email} (ID: ${user.id}): Current credits = ${user.credits}`);
    }

    if (adminUsers.length === 0) {
      console.log('\nNo admin users found. Creating a default admin...');
      const admin = await prisma.user.create({
        data: {
          email: 'admin@atlas.ai',
          password: 'hashed_password_placeholder',
          fullName: 'Admin User',
          role: 'ADMIN',
          credits: 1000,
          subscriptionStatus: 'active',
          subscriptionPlan: 'pro'
        }
      });
      console.log(`Created admin user: ${admin.email} with 1000 credits`);
    } else {
      // Reset credits for all admin users
      console.log('\nResetting credits for all admin users...');
      
      const updatedCount = await prisma.user.updateMany({
        where: { role: 'ADMIN' },
        data: {
          credits: 1000,
          subscriptionStatus: 'active',
          subscriptionPlan: 'pro'
        }
      });

      console.log(`✓ Updated ${updatedCount.count} admin user(s) successfully to 1000 credits.`);
    }

    console.log('\n✅ Admin credits reset successfully!');
    console.log('All admin users now have 1000 credits and active pro subscription.');
    
  } catch (error) {
    console.error('❌ Error resetting admin credits:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminCredits();
