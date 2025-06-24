import { test, expect } from '@playwright/test';

test.describe('Network Chaos Testing', () => {
    /** Test application resilience against random API failures with various error types */
    test('app handles random API failures', async ({ page, context }) => {
        /** Configure random network failure simulation */
        await context.route('**/api/**', route => {
            const randomFailure = Math.random() < 0.4;

            if (randomFailure) {
                const errorType = Math.random();
                if (errorType < 0.33) {
                    route.abort('failed');
                } else if (errorType < 0.66) {
                    route.fulfill({ status: 500 });
                } else {
                    route.fulfill({ status: 404 });
                }
            } else {
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ data: 'success' })
                });
            }
        });

        await page.goto('/');

        /** Define navigation actions for chaos testing */
        const actions = [
            () => page.goto('/offers'),
            () => page.goto('/whyus'),
            () => page.goto('/user/login'),
            () => page.goto('/liked'),
            () => page.reload()
        ];

        /** Execute random actions under unstable network conditions */
        for (let i = 0; i < 15; i++) {
            const randomAction = actions[Math.floor(Math.random() * actions.length)];
            try {
                await randomAction();
                await page.waitForTimeout(500);
            } catch (error) {
                console.log(`Action ${i} failed: ${error}`);
            }
        }
    });

    /** Test application behavior under slow network conditions */
    test('slow network simulation', async ({ page, context }) => {
        /** Simulate very slow network responses */
        await context.route('**/api/**', async route => {
            const delay = Math.random() * 2000 + 500; // 0.5-2.5s delay
            await new Promise(resolve => setTimeout(resolve, delay));

            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ data: 'slow response' })
            });
        });

        /** Test loading behavior with slow network */
        await page.goto('/offers');

        /** Verify page loads despite slow network conditions */
        await page.waitForTimeout(3000);
        await expect(page).toHaveURL('/offers');
    });

    /** Test application stability with intermittent connectivity patterns */
    test('intermittent connectivity', async ({ page, context }) => {
        let requestCount = 0;

        /** Configure intermittent connection failure pattern */
        await context.route('**/api/**', async route => {
            requestCount++;

            if (requestCount % 4 === 0) {
                /** Every 4th request fails - simulating connection drops */
                route.abort('failed');
            } else {
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ data: 'connected' })
                });
            }
        });

        /** Test navigation with intermittent connectivity */
        const pages = ['/', '/offers', '/whyus', '/user/login'];

        for (const url of pages) {
            try {
                await page.goto(url);
                await page.waitForTimeout(1000);
            } catch (error) {
                console.log(`Failed to load ${url}: ${error}`);
            }
        }

        console.log(`Processed ${requestCount} requests with intermittent connectivity`);
    });

    /** Test application handling of API timeout scenarios */
    test('API timeout simulation', async ({ page, context }) => {
        /** Configure random API timeout simulation */
        await context.route('**/api/**', async route => {
            const shouldTimeout = Math.random() < 0.3; // 30% timeout rate

            if (shouldTimeout) {
                /** Simulate timeout with extremely long delay */
                await new Promise(resolve => setTimeout(resolve, 10000));
            }

            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ data: 'finally responded' })
            });
        });

        /** Test application behavior under timeout conditions */
        await page.goto('/');
        await page.waitForTimeout(2000);
    });
});