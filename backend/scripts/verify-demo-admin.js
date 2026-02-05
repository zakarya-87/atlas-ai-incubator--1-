const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyDemoAdmin() {
  try {
    const demoUser = await prisma.user.findUnique({
      where: { email: 'admin-demo@local' }
    });

    if (!demoUser) {
      console.log('❌ Demo admin not found in database');
      return;
    }

    console.log('✅ Demo Admin Configuration Verified');
    console.log('=====================================');
    console.log(`Email: ${demoUser.email}`);
    console.log(`ID: ${demoUser.id}`);
    console.log(`Role: ${demoUser.role}`);
    console.log(`Credits: ${demoUser.credits}`);
    console.log(`Subscription: ${demoUser.subscriptionStatus}`);
    console.log(`Plan: ${demoUser.subscriptionPlan}`);
    console.log('=====================================');
    
    if (demoUser.role === 'ADMIN' && demoUser.credits >= 9999) {
      console.log('✅ Demo admin is properly configured with unlimited credits');
    } else {
      console.log('⚠️  Demo admin may need configuration updates');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDemoAdmin();
