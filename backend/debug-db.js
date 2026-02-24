const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const analyses = await prisma.analysis.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  
  if (analyses.length === 0) {
    console.log("No analyses found.");
    return;
  }
  
  analyses.forEach(a => {
    console.log(`Tool: ${a.tool}, ID: ${a.id}`);
    console.log("resultData inside DB:");
    console.log(a.resultData.substring(0, 500) + '...');
    try {
      const parsed = JSON.parse(a.resultData);
      console.log("Parsed keys:", Object.keys(parsed));
      if (parsed.result) {
        console.log("Nested result keys:", Object.keys(parsed.result));
      }
    } catch(e) {
      console.log("Failed to parse JSON:", e.message);
    }
    console.log("------------------------");
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
