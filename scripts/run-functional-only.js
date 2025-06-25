import { execSync } from 'child_process';

console.log('📱 Running only Functional Tests (Espresso equivalent)');

const functionalTests = [
  'tests/functional/auth.spec.ts',
  'tests/functional/offers-precise.spec.ts',
  'tests/functional/single-offer-precise.spec.ts',
];

functionalTests.forEach(test => {
  console.log(`\n🧪 Running: ${test}`);
  try {
    execSync(`npx playwright test ${test}`, { stdio: 'inherit' });
    console.log(`Test passed: ${test}`);
  } catch (error) {
    console.error(`Test failed: ${test}`);
    console.error(`Error details: ${error.message}`);
  }
});

console.log('\nFunctional tests completed!');
