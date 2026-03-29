const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@atlas.com';
  const newPassword = process.env.ADMIN_PASSWORD;

  if (!newPassword) {
    console.error('❌ ADMIN_PASSWORD environment variable is required.');
    console.error('   Usage: ADMIN_PASSWORD=<new-password> node reset-admin-password.js');
    process.exit(1);
  }

  try {
    console.log('🔑 Resetting admin password...\n');

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    console.log('Creating new hashed password...');
    console.log('Salt rounds: 12');
    console.log('Password hash length:', hashedPassword.length);
    console.log();

    const updated = await prisma.user.update({
      where: { email: adminEmail },
      data: {
        password: hashedPassword,
        fullName: 'Atlas Admin',
        role: 'ADMIN',
        credits: 9999,
        subscriptionStatus: 'active',
        subscriptionPlan: 'enterprise',
      },
    });

    console.log('✅ Admin password reset successfully!');
    console.log();
    console.log('User details:');
    console.log(`   Email: ${updated.email}`);
    console.log(`   Role: ${updated.role}`);
    console.log(`   Credits: ${updated.credits}`);
    console.log(`   Subscription: ${updated.subscriptionStatus}`);
    console.log();
    console.log('🎉 You can now login with the password you provided!');

  } catch (error) {
    console.error('❌ Error resetting password:', error.message);

    if (error.message.includes('Record to update not found')) {
      console.log('\nUser not found, creating new admin...');

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await prisma.user.create({
        data: {
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

      console.log('✅ Admin user created!');
      console.log(`   Email: ${adminEmail}`);
      console.log('   Password: [provided via ADMIN_PASSWORD env var]');
    }
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
