const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    console.log('🔑 Resetting admin password...\n');

    const adminEmail = 'admin@atlas.com';
    const newPassword = 'admin123';
    
    // Hash the password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    console.log('Creating new hashed password...');
    console.log('Salt rounds: 10');
    console.log('Password hash length:', hashedPassword.length);
    console.log();

    // Update the admin user
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
    console.log('Login credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${newPassword}`);
    console.log();
    console.log('🎉 You can now login with these credentials!');

  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
    
    // If user doesn't exist, create it
    if (error.message.includes('Record to update not found')) {
      console.log('\nUser not found, creating new admin...');
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const newUser = await prisma.user.create({
        data: {
          id: 'f4b3c2a1-1234-5678-9abc-def012345678',
          email: 'admin@atlas.com',
          password: hashedPassword,
          fullName: 'Atlas Admin',
          role: 'ADMIN',
          credits: 9999,
          subscriptionStatus: 'active',
          subscriptionPlan: 'enterprise',
        },
      });
      
      console.log('✅ Admin user created!');
      console.log('   Email: admin@atlas.com');
      console.log('   Password: admin123');
    }
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
