const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function setupDemoAdmin() {
  try {
    const demoEmail = 'admin-demo@local';
    const demoPassword = 'demo123';
    
    // Check if demo admin already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: demoEmail }
    });

    if (existingUser) {
      console.log('Demo admin already exists, updating credits...');
      const updated = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          credits: 9999,
          subscriptionStatus: 'active',
          subscriptionPlan: 'pro',
          role: 'ADMIN'
        }
      });
      console.log(`✅ Updated demo admin: ${updated.email}`);
      console.log(`   Credits: ${updated.credits}`);
      console.log(`   Status: ${updated.subscriptionStatus}`);
      console.log(`   Role: ${updated.role}`);
    } else {
      console.log('Creating new demo admin user...');
      
      // Hash the password
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(demoPassword, salt);
      
      // Create demo admin
      const demoAdmin = await prisma.user.create({
        data: {
          email: demoEmail,
          password: hashedPassword,
          fullName: 'Admin (Demo)',
          role: 'ADMIN',
          credits: 9999,
          subscriptionStatus: 'active',
          subscriptionPlan: 'pro'
        }
      });
      
      console.log(`✅ Created demo admin: ${demoAdmin.email}`);
      console.log(`   Password: [set via DEMO_ADMIN_PASSWORD env var or default]`);
      console.log(`   Credits: ${demoAdmin.credits}`);
      console.log(`   Status: ${demoAdmin.subscriptionStatus}`);
      console.log(`   Role: ${demoAdmin.role}`);
    }

    console.log('\n🎉 Demo admin is ready to use!');
    console.log('\nLogin credentials:');
    console.log('   Email: admin-demo@local');
    console.log('   Password: demo123');
    console.log('   Or click "Demo Admin" button in the login modal');
    
  } catch (error) {
    console.error('❌ Error setting up demo admin:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupDemoAdmin();
