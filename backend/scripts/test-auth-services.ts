/**
 * Authentication Services Test Script
 * Tests user credentials, authentication flow, and resource access
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message?: string;
}

const results: TestResult[] = [];

function logResult(result: TestResult) {
  results.push(result);
  const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
  console.log(`${icon} ${result.test}: ${result.status}${result.message ? ` - ${result.message}` : ''}`);
}

async function testDatabaseConnection() {
  console.log('\n🔌 Testing Database Connection...\n');

  try {
    await prisma.$connect();
    logResult({
      test: 'Database Connection',
      status: 'PASS',
      message: 'Successfully connected to database'
    });
    return true;
  } catch (error: any) {
    logResult({
      test: 'Database Connection',
      status: 'FAIL',
      message: error.message
    });
    return false;
  }
}

async function testUserCRUD() {
  console.log('\n👤 Testing User CRUD Operations...\n');

  const testEmail = `test-${Date.now()}@atlas-test.com`;
  const testPassword = 'TestPassword123!';
  let userId: string | null = null;

  try {
    // Test CREATE
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        role: 'user'
      }
    });
    userId = user.id;

    logResult({
      test: 'User Creation',
      status: user ? 'PASS' : 'FAIL',
      message: user ? `Created user with ID: ${user.id}` : 'Failed to create user'
    });

    // Test READ
    const foundUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });

    logResult({
      test: 'User Read',
      status: foundUser ? 'PASS' : 'FAIL',
      message: foundUser ? 'Successfully retrieved user' : 'Failed to find user'
    });

    // Test password verification
    const isPasswordValid = await bcrypt.compare(testPassword, foundUser?.password || '');
    logResult({
      test: 'Password Verification',
      status: isPasswordValid ? 'PASS' : 'FAIL',
      message: isPasswordValid ? 'Password hash verified' : 'Password verification failed'
    });

    // Test UPDATE
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: 'admin' }
    });

    logResult({
      test: 'User Update',
      status: updatedUser.role === 'admin' ? 'PASS' : 'FAIL',
      message: updatedUser.role === 'admin' ? 'Successfully updated user role' : 'Failed to update user'
    });

    // Test DELETE
    await prisma.user.delete({
      where: { id: userId }
    });

    const deletedUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    logResult({
      test: 'User Deletion',
      status: !deletedUser ? 'PASS' : 'FAIL',
      message: !deletedUser ? 'Successfully deleted user' : 'Failed to delete user'
    });

  } catch (error: any) {
    logResult({
      test: 'User CRUD Operations',
      status: 'FAIL',
      message: error.message
    });

    // Cleanup on error
    if (userId) {
      try {
        await prisma.user.delete({ where: { id: userId } });
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
}

async function testUserVentureAssociations() {
  console.log('\n🏢 Testing User-Venture Associations...\n');

  const testEmail = `test-venture-${Date.now()}@atlas-test.com`;
  let userId: string | null = null;
  let ventureId: string | null = null;

  try {
    // Create test user
    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        role: 'user'
      }
    });
    userId = user.id;

    // Create test venture
    const venture = await prisma.venture.create({
      data: {
        name: 'Test Venture',
        description: 'Test venture for association testing',
        userId: userId
      }
    });
    ventureId = venture.id;

    logResult({
      test: 'Venture Creation',
      status: venture ? 'PASS' : 'FAIL',
      message: venture ? `Created venture with ID: ${venture.id}` : 'Failed to create venture'
    });

    // Test user-venture association
    const userWithVentures = await prisma.user.findUnique({
      where: { id: userId },
      include: { ownedVentures: true }
    });

    const hasVenture = userWithVentures?.ownedVentures.some(v => v.id === ventureId);
    logResult({
      test: 'User-Venture Association',
      status: hasVenture ? 'PASS' : 'FAIL',
      message: hasVenture ? 'Venture correctly associated with user' : 'Association failed'
    });

    // Cleanup
    if (ventureId) {
      await prisma.venture.delete({ where: { id: ventureId } });
    }
    if (userId) {
      await prisma.user.delete({ where: { id: userId } });
    }

  } catch (error: any) {
    logResult({
      test: 'User-Venture Associations',
      status: 'FAIL',
      message: error.message
    });

    // Cleanup on error
    try {
      if (ventureId) await prisma.venture.delete({ where: { id: ventureId } });
      if (userId) await prisma.user.delete({ where: { id: userId } });
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

async function testJWTConfiguration() {
  console.log('\n🔐 Testing JWT Configuration...\n');

  const jwtSecret = process.env.JWT_SECRET;

  logResult({
    test: 'JWT Secret Configuration',
    status: jwtSecret && jwtSecret.length >= 32 ? 'PASS' : 'FAIL',
    message: jwtSecret
      ? `JWT secret configured (length: ${jwtSecret.length})`
      : 'JWT secret not configured or too short'
  });
}

async function testAPIKeyConfiguration() {
  console.log('\n🔑 Testing API Key Configuration...\n');

  const apiKey = process.env.API_KEY;

  logResult({
    test: 'API Key Configuration',
    status: apiKey && !apiKey.includes('your-') ? 'PASS' : 'FAIL',
    message: apiKey && !apiKey.includes('your-')
      ? 'API key configured'
      : 'API key not configured or using placeholder'
  });
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60) + '\n');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`\nSuccess Rate: ${((passed / (total - skipped)) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   - ${r.test}: ${r.message}`);
    });
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

async function main() {
  console.log('🚀 ATLAS Authentication & User Services Test Suite\n');
  console.log('Testing database, user credentials, and resource access...\n');

  try {
    const dbConnected = await testDatabaseConnection();

    if (dbConnected) {
      await testUserCRUD();
      await testUserVentureAssociations();
    } else {
      console.log('\n⚠️  Skipping database-dependent tests due to connection failure\n');
    }

    await testJWTConfiguration();
    await testAPIKeyConfiguration();

    printSummary();

    // Exit with appropriate code
    const failed = results.filter(r => r.status === 'FAIL').length;
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Fatal error during test execution:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
