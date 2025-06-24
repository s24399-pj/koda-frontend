import { execSync } from 'child_process';

console.log('Running only Monkey Tests (Non-functional)');

const monkeyTests = [
  'tests/monkey/chaos.spec.ts',
  'tests/monkey/stress.spec.ts',
  'tests/monkey/network-chaos.spec.ts',
  'tests/monkey/memory-leak.spec.ts',
  'tests/monkey/ui-chaos.spec.ts',
];

monkeyTests.forEach(test => {
  console.log(`\nRunning: ${test}`);
  try {
    execSync(`npx playwright test ${test}`, { stdio: 'inherit' });
    console.log(`Test passed: ${test}`);
  } catch (error) {
    console.error(`Test failed: ${test}`);
    console.error(`Error details: ${error.message}`);
  }
});

console.log('\nMonkey tests completed!');
