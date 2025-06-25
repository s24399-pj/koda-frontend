import { execSync } from 'child_process';

function runCommand(command, description) {
  console.log(`\n🔧 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed successfully`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
  }
}

function runAllTests() {
  console.log('🚀 Starting Complete PWA Test Suite\n');

  runCommand('npx playwright test --reporter=html', 'All E2E Tests');

  console.log('\n🎉 All tests completed!');
  console.log('\n📊 Open HTML report with: npx playwright show-report');

  try {
    console.log('\n🌐 Opening HTML report...');
    execSync('npx playwright show-report', { stdio: 'inherit' });
  } catch (error) {
    console.log('Could not auto-open report. Run: npx playwright show-report');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export { runAllTests };
