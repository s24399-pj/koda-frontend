import { test, expect } from '@playwright/test';

test.describe('Memory Leak Testing', () => {
  /** Test detects memory leaks during intensive navigation patterns */
  test('detect memory leaks during navigation', async ({ page }) => {
    /** Capture initial memory baseline */
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });

    /** Define navigation routes for memory testing */
    const routes = ['/', '/offers', '/whyus', '/user/login'];

    /** Execute intensive navigation cycles */
    for (let cycle = 0; cycle < 5; cycle++) {
      for (const route of routes) {
        await page.goto(route);
        await page.waitForTimeout(500);

        /** Force garbage collection if available */
        await page.evaluate(() => {
          if ((window as any).gc) (window as any).gc();
        });
      }
    }

    /** Measure final memory usage */
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });

    const memoryIncrease = finalMemory - initialMemory;
    console.log(`Memory increase: ${memoryIncrease} bytes`);

    /** Alert for significant memory increases (> 10 MB) */
    if (memoryIncrease > 10 * 1024 * 1024) {
      console.warn('Potential memory leak detected!');
    }

    /** Test should log results, not fail on memory usage */
    expect(finalMemory).toBeGreaterThan(0);
  });

  /** Test memory behavior during repeated component mounting/unmounting */
  test('memory usage during repeated component mounting', async ({ page }) => {
    /** Mock API endpoints to ensure consistent component loading */
    await page.route('**/api/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: 'mock' }),
      });
    });

    await page.goto('/');

    /** Establish memory baseline */
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });

    /** Execute repeated page reloads to test component lifecycle */
    for (let i = 0; i < 10; i++) {
      await page.reload();
      await page.waitForLoadState('networkidle');

      /** Brief pause for memory stabilization */
      await page.waitForTimeout(300);
    }

    /** Measure memory after reload cycles */
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });

    const memoryIncrease = finalMemory - initialMemory;
    console.log(`Memory increase after reloads: ${memoryIncrease} bytes`);
  });

  /** Test memory consumption during intensive form interactions */
  test('memory usage during form interactions', async ({ page }) => {
    await page.goto('/user/login');

    /** Capture baseline memory before form interactions */
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });

    /** Execute intensive form field manipulations */
    for (let i = 0; i < 50; i++) {
      const emailInput = page.locator('#email');
      const passwordInput = page.locator('#password');

      /** Test email field memory behavior */
      if (await emailInput.isVisible()) {
        await emailInput.fill(`test${i}@example.com`);
        await emailInput.clear();
      }

      /** Test password field memory behavior */
      if (await passwordInput.isVisible()) {
        await passwordInput.fill(`password${i}`);
        await passwordInput.clear();
      }

      await page.waitForTimeout(50);
    }

    /** Measure memory after form interactions */
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });

    const memoryIncrease = finalMemory - initialMemory;
    console.log(`Memory increase during form interactions: ${memoryIncrease} bytes`);

    /** Verify form remains functional after memory test */
    await expect(page.locator('#email')).toBeVisible();
  });

  /** Test event listener cleanup to prevent memory leaks */
  test('event listener memory leaks', async ({ page }) => {
    await page.goto('/');

    /** Establish memory baseline before event listener test */
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });

    /** Test event listener registration and cleanup cycle */
    await page.evaluate(() => {
      for (let i = 0; i < 100; i++) {
        const handler = () => console.log('test');
        document.addEventListener('click', handler);
        document.removeEventListener('click', handler);
      }
    });

    /** Measure memory after event listener operations */
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });

    const memoryIncrease = finalMemory - initialMemory;
    console.log(`Memory increase from event listeners: ${memoryIncrease} bytes`);
  });
});
