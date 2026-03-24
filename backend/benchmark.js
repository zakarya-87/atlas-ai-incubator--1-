async function runBench() {
  const users = Array.from({ length: 100 }, (_, i) => ({ id: `user-${i}` }));

  // Mock N+1 query
  const startNPlus1 = performance.now();
  for (const user of users) {
    // Simulate ~10ms network/DB latency per query
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  const endNPlus1 = performance.now();

  // Mock single query
  const startSingle = performance.now();
  // Simulate slightly longer ~15ms query since it updates more records
  await new Promise(resolve => setTimeout(resolve, 15));
  const endSingle = performance.now();

  console.log(`Simulated updating 100 admin users:`);
  console.log(`N+1 Query approach: ${(endNPlus1 - startNPlus1).toFixed(2)}ms`);
  console.log(`Bulk Update approach: ${(endSingle - startSingle).toFixed(2)}ms`);
  console.log(`Theoretical Speedup: ${((endNPlus1 - startNPlus1) / (endSingle - startSingle)).toFixed(2)}x`);
}
runBench();
