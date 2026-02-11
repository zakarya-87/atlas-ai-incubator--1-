/**
 * Comprehensive AI Services Test Script
 * Tests all AI providers, API keys, and service connectivity
 */

import { ConfigService } from '@nestjs/config';
import { MistralProvider } from '../src/analysis/providers/mistral.provider';
import { GrokProvider } from '../src/analysis/providers/grok.provider';
import { OpenAIProvider } from '../src/analysis/providers/openai.provider';
import { AIProviderFactory } from '../src/analysis/providers/ai-provider.factory';
import { AIProvider } from '../src/analysis/interfaces/ai-provider.interface';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

interface TestResult {
  provider: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message?: string;
  duration?: number;
}

const results: TestResult[] = [];

function logResult(result: TestResult) {
  results.push(result);
  const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
  console.log(`${icon} [${result.provider}] ${result.test}: ${result.status}${result.message ? ` - ${result.message}` : ''}`);
}

async function testConfigService() {
  console.log('\n🔧 Testing Configuration Service...\n');

  const configService = new ConfigService();

  // Test Gemini configuration
  const geminiKey = configService.get<string>('GEMINI_API_KEY');
  logResult({
    provider: 'Gemini',
    test: 'API Key Configuration',
    status: geminiKey ? 'PASS' : 'FAIL',
    message: geminiKey ? 'Key found' : 'Key missing'
  });

  // Test Mistral configuration
  const mistralKey = configService.get<string>('MISTRAL_API_KEY');
  logResult({
    provider: 'Mistral',
    test: 'API Key Configuration',
    status: mistralKey ? 'PASS' : 'FAIL',
    message: mistralKey ? 'Key found' : 'Key missing'
  });

  // Test Grok configuration
  const grokKey = configService.get<string>('GROK_API_KEY');
  logResult({
    provider: 'Grok',
    test: 'API Key Configuration',
    status: grokKey && !grokKey.includes('your-') ? 'PASS' : 'SKIP',
    message: grokKey && !grokKey.includes('your-') ? 'Key found' : 'Placeholder key detected'
  });

  // Test Azure OpenAI configuration
  const azureKey = configService.get<string>('AZURE_OPENAI_API_KEY');
  const azureEndpoint = configService.get<string>('AZURE_OPENAI_ENDPOINT');
  logResult({
    provider: 'Azure OpenAI',
    test: 'API Key Configuration',
    status: azureKey && azureEndpoint ? 'PASS' : 'FAIL',
    message: azureKey && azureEndpoint ? 'Key and endpoint found' : 'Missing configuration'
  });

  // Test default provider
  const defaultProvider = configService.get<string>('DEFAULT_AI_PROVIDER');
  logResult({
    provider: 'System',
    test: 'Default Provider Configuration',
    status: defaultProvider ? 'PASS' : 'FAIL',
    message: defaultProvider ? `Set to: ${defaultProvider}` : 'Not configured'
  });

  // Test Gemini Vertex AI Configuration
  const geminiBaseUrl = configService.get<string>('GEMINI_API_BASE_URL');
  const geminiVersion = configService.get<string>('GEMINI_API_VERSION');

  logResult({
    provider: 'Gemini',
    test: 'Vertex AI Endpoint Configuration',
    status: geminiBaseUrl ? 'PASS' : 'SKIP',
    message: geminiBaseUrl
      ? `Custom Endpoint: ${geminiBaseUrl}`
      : 'Using default Google AI Studio endpoint (Standard)'
  });
}

async function testMistralProvider() {
  console.log('\n🤖 Testing Mistral Provider...\n');

  const configService = new ConfigService();
  const mistralKey = configService.get<string>('MISTRAL_API_KEY');

  if (!mistralKey || mistralKey.includes('your-')) {
    logResult({
      provider: 'Mistral',
      test: 'Provider Connectivity',
      status: 'SKIP',
      message: 'API key not configured'
    });
    return;
  }

  const provider = new MistralProvider(configService);

  try {
    const startTime = Date.now();
    const response = await provider.complete({
      prompt: 'Say "Hello from ATLAS AI" in JSON format with a "message" field.',
      context: '',
      schema: { type: 'object', properties: { message: { type: 'string' } } }
    });
    const duration = Date.now() - startTime;

    const isValid = response.data && typeof response.data.message === 'string';
    logResult({
      provider: 'Mistral',
      test: 'Provider Connectivity',
      status: isValid ? 'PASS' : 'FAIL',
      message: isValid ? `Response received in ${duration}ms` : 'Invalid response format',
      duration
    });

    if (isValid) {
      console.log(`   Response: ${response.data.message}`);
    }
  } catch (error: any) {
    logResult({
      provider: 'Mistral',
      test: 'Provider Connectivity',
      status: 'FAIL',
      message: error.message
    });
  }
}

async function testGrokProvider() {
  console.log('\n🤖 Testing Grok Provider...\n');

  const configService = new ConfigService();
  const grokKey = configService.get<string>('GROK_API_KEY');

  if (!grokKey || grokKey.includes('your-')) {
    logResult({
      provider: 'Grok',
      test: 'Provider Connectivity',
      status: 'SKIP',
      message: 'API key not configured'
    });
    return;
  }

  const provider = new GrokProvider(configService);

  try {
    const startTime = Date.now();
    const response = await provider.complete({
      prompt: 'Say "Hello from ATLAS AI" in JSON format with a "message" field.',
      context: '',
      schema: { type: 'object', properties: { message: { type: 'string' } } }
    });
    const duration = Date.now() - startTime;

    const isValid = response.data && typeof response.data.message === 'string';
    logResult({
      provider: 'Grok',
      test: 'Provider Connectivity',
      status: isValid ? 'PASS' : 'FAIL',
      message: isValid ? `Response received in ${duration}ms` : 'Invalid response format',
      duration
    });

    if (isValid) {
      console.log(`   Response: ${response.data.message}`);
    }
  } catch (error: any) {
    logResult({
      provider: 'Grok',
      test: 'Provider Connectivity',
      status: 'FAIL',
      message: error.message
    });
  }
}

async function testOpenAIProvider() {
  console.log('\n🤖 Testing Azure OpenAI Provider...\n');

  const configService = new ConfigService();
  const azureKey = configService.get<string>('AZURE_OPENAI_API_KEY');
  const azureEndpoint = configService.get<string>('AZURE_OPENAI_ENDPOINT');

  if (!azureKey || !azureEndpoint) {
    logResult({
      provider: 'Azure OpenAI',
      test: 'Provider Connectivity',
      status: 'SKIP',
      message: 'API key or endpoint not configured'
    });
    return;
  }

  const provider = new OpenAIProvider(configService);

  try {
    const startTime = Date.now();
    const response = await provider.complete({
      prompt: 'Say "Hello from ATLAS AI" in JSON format with a "message" field.',
      context: '',
      schema: { type: 'object', properties: { message: { type: 'string' } } }
    });
    const duration = Date.now() - startTime;

    const isValid = response.data && typeof response.data.message === 'string';
    logResult({
      provider: 'Azure OpenAI',
      test: 'Provider Connectivity',
      status: isValid ? 'PASS' : 'FAIL',
      message: isValid ? `Response received in ${duration}ms` : 'Invalid response format',
      duration
    });

    if (isValid) {
      console.log(`   Response: ${response.data.message}`);
    }
  } catch (error: any) {
    logResult({
      provider: 'Azure OpenAI',
      test: 'Provider Connectivity',
      status: 'FAIL',
      message: error.message
    });
  }
}

async function testProviderFactory() {
  console.log('\n🏭 Testing AI Provider Factory...\n');

  const configService = new ConfigService();
  const mistralProvider = new MistralProvider(configService);
  const grokProvider = new GrokProvider(configService);
  const openAIProvider = new OpenAIProvider(configService);

  const factory = new AIProviderFactory(
    configService,
    mistralProvider,
    grokProvider,
    openAIProvider
  );

  // Test factory initialization
  const availableProviders = factory.getAvailableProviders();
  logResult({
    provider: 'Factory',
    test: 'Initialization',
    status: availableProviders.length > 0 ? 'PASS' : 'FAIL',
    message: `${availableProviders.length} providers registered: ${availableProviders.join(', ')}`
  });

  // Test getting specific provider
  const mistral = factory.getProvider(AIProvider.MISTRAL);
  logResult({
    provider: 'Factory',
    test: 'Get Mistral Provider',
    status: mistral ? 'PASS' : 'FAIL',
    message: mistral ? 'Provider retrieved successfully' : 'Failed to retrieve provider'
  });

  // Test default provider selection
  const defaultProvider = configService.get<string>('DEFAULT_AI_PROVIDER');
  if (defaultProvider) {
    try {
      const response = await factory.complete({
        prompt: 'Say "Hello from ATLAS AI" in JSON format with a "message" field.',
        context: '',
        schema: { type: 'object', properties: { message: { type: 'string' } } }
      });

      logResult({
        provider: 'Factory',
        test: `Default Provider (${defaultProvider})`,
        status: response.data ? 'PASS' : 'FAIL',
        message: response.data ? 'Successfully used default provider' : 'Failed to use default provider'
      });
    } catch (error: any) {
      logResult({
        provider: 'Factory',
        test: `Default Provider (${defaultProvider})`,
        status: 'FAIL',
        message: error.message
      });
    }
  }
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
      console.log(`   - [${r.provider}] ${r.test}: ${r.message}`);
    });
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

async function main() {
  console.log('🚀 ATLAS AI Services Test Suite\n');
  console.log('Testing AI providers, API keys, and service connectivity...\n');

  try {
    await testConfigService();
    await testMistralProvider();
    await testGrokProvider();
    await testOpenAIProvider();
    await testProviderFactory();

    printSummary();

    // Exit with appropriate code
    const failed = results.filter(r => r.status === 'FAIL').length;
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Fatal error during test execution:', error);
    process.exit(1);
  }
}

main();
