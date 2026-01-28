const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const analysis = await prisma.analysis.findFirst({
    where: { tool: 'ideaValidation' },
    orderBy: { createdAt: 'desc' },
  });

  if (analysis) {
    console.log('=== Analysis Record ===');
    console.log('ID:', analysis.id);
    console.log('Tool:', analysis.tool);
    console.log('Result Data (first 2000 chars):');
    const data =
      typeof analysis.resultData === 'string'
        ? analysis.resultData
        : JSON.stringify(analysis.resultData);
    console.log(data.substring(0, 2000));
  } else {
    console.log('No ideaValidation records found');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
