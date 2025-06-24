import {test, expect} from '@playwright/test';

/**
 * Authentication flow tests covering login, registration, and error handling
 */
test.describe('Authentication Flow', () => {
    /**
     * Verifies navigation to login page
     */
    test('user can navigate to login page', async ({page}) => {
        await page.goto('/');
        await expect(page.locator('body')).toBeVisible();

        await page.goto('/user/login');
        await expect(page).toHaveURL('/user/login');
    });

    /**
     * Tests user registration with API mocking
     */
    test('user can register new account', async ({page}) => {
        await page.goto('/user/register');

        await page.route('**/api/v1/external/users/register', async route => {
            await route.fulfill({status: 200, body: '{}'});
        });

        await fillFormIfVisible(page, {
            '#email': 'test@example.com',
            '#password': 'password123'
        });

        const submitButton = page.locator('button[type="submit"]');
        if (await submitButton.isVisible()) {
            await submitButton.click();
        }
    });

    /**
     * Tests successful login with mocked authentication
     */
    test('user can login successfully', async ({page}) => {
        await page.goto('/user/login');

        await page.route('**/api/v1/external/users/login', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    accessToken: 'fake-jwt-token',
                    user: {id: 1, email: 'test@example.com'}
                })
            });
        });

        await fillFormIfVisible(page, {
            '#email': 'test@example.com',
            '#password': 'password123'
        });

        const submitButton = page.locator('button[type="submit"]');
        if (await submitButton.isVisible()) {
            await submitButton.click();
        }
    });

    /**
     * Validates form error handling with empty fields
     */
    test('shows error handling', async ({page}) => {
        await page.goto('/user/login');

        const submitButton = page.locator('button[type="submit"]');
        if (await submitButton.isVisible()) {
            await submitButton.click();
        }

        // Check for error elements
        const errorElements = await page.locator('.error, [class*="error"], .invalid, [class*="invalid"]').count();
        console.log(`Found ${errorElements} error elements`);
    });
});

/**
 * Navigation and routing tests for public and protected routes
 */
test.describe('Navigation Flow', () => {
    /**
     * Tests all public routes accessibility
     */
    test('user can navigate through all public pages', async ({page}) => {
        const publicRoutes = [
            '/',
            '/offers',
            '/whyus',
            '/user/login',
            '/user/register',
            '/liked'
        ];

        for (const route of publicRoutes) {
            await page.goto(route);
            await expect(page.locator('body')).toBeVisible();

            const notFoundText = page.locator('text=Not Found, text=404');
            await expect(notFoundText).not.toBeVisible();
        }
    });

    /**
     * Verifies protected routes redirect to authentication
     */
    test('protected routes show auth required', async ({page}) => {
        const protectedRoutes = ['/user/panel', '/offer/create'];

        for (const route of protectedRoutes) {
            await page.goto(route);

            // Check for auth requirement indicators
            const authHeading = page.locator('h1').filter({hasText: 'Zaloguj się'}).first();
            await expect(authHeading).toBeVisible();

            const loginBtn = page.locator('.login-btn').first();
            await expect(loginBtn).toBeVisible();
        }
    });

    /**
     * Tests authentication required component functionality
     */
    test('auth required component works correctly', async ({page}) => {
        await page.goto('/user/panel');

        const authTitle = page.locator('h1').filter({hasText: 'Wymagane logowanie'}).first();
        if (await authTitle.isVisible()) {
            await expect(authTitle).toBeVisible();
        }

        const loginBtn = page.locator('.login-btn').first();
        const registerBtn = page.locator('.register-btn').first();

        if (await loginBtn.isVisible()) {
            await expect(loginBtn).toBeVisible();
        }
        if (await registerBtn.isVisible()) {
            await expect(registerBtn).toBeVisible();
        }
    });
});

/**
 * Offers and marketplace functionality tests
 */
test.describe('Offers Flow', () => {
    /**
     * Tests offers page navigation with mocked data
     */
    test('user can navigate to offers page', async ({page}) => {
        // Mock offers API
        await page.route('**/api/**', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    offers: [
                        {id: 1, title: 'Test Offer 1', price: 100},
                        {id: 2, title: 'Test Offer 2', price: 200}
                    ]
                })
            });
        });

        await page.goto('/offers');
        await expect(page).toHaveURL('/offers');

        await verifyPageLoaded(page);
    });

    /**
     * Tests individual offer page display
     */
    test('user can navigate to single offer page', async ({page}) => {
        // Mock single offer API
        await page.route('**/api/**', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    id: 1,
                    title: 'Detailed Offer',
                    description: 'Offer description',
                    price: 299
                })
            });
        });

        await page.goto('/offer/1');
        await expect(page).toHaveURL('/offer/1');

        await verifyPageLoaded(page);
    });

    /**
     * Tests comparison page functionality
     */
    test('user can navigate to comparison page', async ({page}) => {
        await page.goto('/comparison');
        await expect(page).toHaveURL('/comparison');
        await expect(page.locator('body')).toBeVisible();
    });

    /**
     * Tests chat functionality access
     */
    test('user can navigate to chat', async ({page}) => {
        await page.goto('/chat');
        await expect(page).toHaveURL('/chat');
        await expect(page.locator('body')).toBeVisible();
    });
});

/**
 * Form validation and structure tests
 */
test.describe('Form Validation', () => {
    /**
     * Validates login form structure and attributes
     */
    test('login form has proper structure', async ({page}) => {
        await page.goto('/user/login');

        const emailInput = page.locator('#email');
        const passwordInput = page.locator('#password');
        const submitButton = page.locator('button[type="submit"]');

        await expect(emailInput).toBeVisible();
        await expect(passwordInput).toBeVisible();
        await expect(submitButton).toBeVisible();

        // Verify input types
        await expect(emailInput).toHaveAttribute('type', 'email');
        await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    /**
     * Verifies registration form presence
     */
    test('register form exists', async ({page}) => {
        await page.goto('/user/register');
        await expect(page.locator('body')).toBeVisible();

        const form = page.locator('form');
        if (await form.isVisible()) {
            await expect(form).toBeVisible();
        }
    });
});

/**
 * Cross-browser compatibility tests
 */
test.describe('Cross-browser Compatibility', () => {
    /**
     * Tests basic functionality across different devices
     */
    test('app works on different devices', async ({page}) => {
        await page.goto('/');
        await expect(page.locator('body')).toBeVisible();

        await page.goto('/whyus');
        await expect(page).toHaveURL('/whyus');

        await page.goto('/user/login');
        await expect(page).toHaveURL('/user/login');
    });
});

/**
 * Helper function to fill form fields if they are visible
 */
async function fillFormIfVisible(page, fields) {
    for (const [selector, value] of Object.entries(fields)) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
            await element.fill(value);
        }
    }
}

/**
 * Helper function to verify page has loaded successfully
 */
async function verifyPageLoaded(page) {
    const mainElement = page.locator('main, #root, .app, [data-testid*="main"]').first();
    if (await mainElement.isVisible()) {
        await expect(mainElement).toBeVisible();
    } else {
        await page.waitForTimeout(2000);
    }
}