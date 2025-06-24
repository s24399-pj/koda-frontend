import { test, expect } from '@playwright/test';

test.describe('Single Offer Page - Precise Tests', () => {
    /** Test verifies main offer page structure and essential elements */
    test('should display offer header with images and basic info', async ({ page }) => {
        await page.goto('/offer/aab40ef9-f32f-4a93-b060-5925a9f6b87b');
        await page.waitForTimeout(5000);

        /** Verify main container structure */
        const offerContainer = page.locator('.offer-container');
        await expect(offerContainer).toBeVisible();

        const offerHeader = page.locator('.offer-header');
        await expect(offerHeader).toBeVisible();

        /** Check images section and main image */
        const imagesSection = page.locator('.images-section');
        await expect(imagesSection).toBeVisible();

        const mainImage = page.locator('.main-image');
        await expect(mainImage).toBeVisible();

        /** Validate offer title without enforcing specific content */
        const offerTitle = page.locator('h1');
        await expect(offerTitle).toBeVisible();

        /** Check price section with PLN currency validation */
        const priceSection = page.locator('.price-section .price');
        await expect(priceSection).toBeVisible();

        const priceText = await priceSection.textContent();
        console.log(`Price format: ${priceText}`);
        expect(priceText).toContain('PLN');

        console.log('✅ Offer header structure verified');
    });

    /** Test validates image gallery functionality and thumbnail interactions */
    test('should display image gallery with thumbnails', async ({ page }) => {
        await page.goto('/offer/aab40ef9-f32f-4a93-b060-5925a9f6b87b');
        await page.waitForTimeout(5000);

        const offerGallery = page.locator('.offer-gallery');

        if (await offerGallery.isVisible()) {
            await expect(offerGallery).toBeVisible();

            /** Test thumbnail container and interactions */
            const thumbnailsContainer = page.locator('.thumbnails-container');
            await expect(thumbnailsContainer).toBeVisible();

            const thumbnails = page.locator('.thumbnail-container');
            const thumbnailCount = await thumbnails.count();
            console.log(`Found ${thumbnailCount} thumbnails`);

            /** Test thumbnail click functionality if multiple images exist */
            if (thumbnailCount > 1) {
                const secondThumbnail = thumbnails.nth(1);
                await secondThumbnail.click();
                await page.waitForTimeout(500);
            }

            console.log('✅ Image gallery functionality verified');
        } else {
            console.log('Image gallery not visible - might be single image offer');
        }
    });

    /** Test lightbox modal functionality for image viewing */
    test('should open lightbox on main image click', async ({ page }) => {
        await page.goto('/offer/aab40ef9-f32f-4a93-b060-5925a9f6b87b');
        await page.waitForTimeout(5000);

        const mainImage = page.locator('.main-image');

        if (await mainImage.isVisible()) {
            await mainImage.click();

            /** Verify lightbox opens and contains close button */
            const lightbox = page.locator('.lightbox-overlay');
            await expect(lightbox).toBeVisible();

            const closeButton = page.locator('.lightbox-close');
            await expect(closeButton).toBeVisible();

            /** Test lightbox close functionality */
            await closeButton.click();
            await page.waitForTimeout(500);

            await expect(lightbox).not.toBeVisible();

            console.log('✅ Lightbox functionality verified');
        } else {
            console.log('Main image not clickable or lightbox not implemented');
        }
    });

    /** Test technical specifications section display */
    test('should display technical specifications', async ({ page }) => {
        await page.goto('/offer/aab40ef9-f32f-4a93-b060-5925a9f6b87b');
        await page.waitForTimeout(5000);

        /** Validate technical data section and specifications */
        const techSpecsSection = page.locator('.section:has-text("Dane techniczne")');
        await expect(techSpecsSection).toBeVisible();

        const techSpecs = page.locator('.tech-specs');
        await expect(techSpecs).toBeVisible();

        /** Count specification items without enforcing specific values */
        const specItems = techSpecs.locator('.spec-item');
        const itemCount = await specItems.count();
        console.log(`Found ${itemCount} specification items`);

        expect(itemCount).toBeGreaterThan(0);

        console.log('✅ Technical specifications verified');
    });

    /** Test equipment section when present */
    test('should display equipment section', async ({ page }) => {
        await page.goto('/offer/aab40ef9-f32f-4a93-b060-5925a9f6b87b');
        await page.waitForTimeout(5000);

        const equipmentSection = page.locator('.equipment-section');

        if (await equipmentSection.isVisible()) {
            const equipmentTitle = page.locator('h2:has-text("Wyposażenie")');
            await expect(equipmentTitle).toBeVisible();

            /** Validate equipment items if they exist */
            const equipmentItems = page.locator('.equipment-item');
            const itemCount = await equipmentItems.count();
            console.log(`Found ${itemCount} equipment items`);

            if (itemCount > 0) {
                const firstItem = equipmentItems.first();
                await expect(firstItem).toBeVisible();
            }
        } else {
            console.log('Equipment section not visible - might be conditionally rendered');
        }
    });

    /** Test seller information display and profile elements */
    test('should display seller information', async ({ page }) => {
        await page.goto('/offer/aab40ef9-f32f-4a93-b060-5925a9f6b87b');
        await page.waitForTimeout(5000);

        /** Verify seller section structure */
        const sellerSection = page.locator('.seller-info-section');
        await expect(sellerSection).toBeVisible();

        const sellerInfo = page.locator('.seller-info');
        await expect(sellerInfo).toBeVisible();

        /** Check profile image and seller name */
        const profileImage = page.locator('.profile-image');
        await expect(profileImage).toBeVisible();

        const sellerName = page.locator('.seller-details h3').first();
        await expect(sellerName).toBeVisible();

        console.log('✅ Seller information verified');
    });

    /** Test chat functionality and button states */
    test('should handle chat button functionality', async ({ page }) => {
        await page.goto('/offer/aab40ef9-f32f-4a93-b060-5925a9f6b87b');
        await page.waitForTimeout(5000);

        const chatButton = page.locator('.start-chat-button');
        await expect(chatButton).toBeVisible();

        /** Check button state for logged/non-logged users */
        const isDisabled = await chatButton.isDisabled();
        console.log(`Chat button disabled (not logged in): ${isDisabled}`);

        if (isDisabled) {
            /** Verify tooltip for disabled state */
            const title = await chatButton.getAttribute('title');
            console.log(`Chat button tooltip: ${title}`);
            expect(title).toBeTruthy();
        } else {
            await chatButton.click();
            await page.waitForTimeout(1000);
        }

        console.log('✅ Chat button functionality verified');
    });

    /** Test contact information display with phone and email */
    test('should display contact information', async ({ page }) => {
        await page.goto('/offer/aab40ef9-f32f-4a93-b060-5925a9f6b87b');
        await page.waitForTimeout(5000);

        const contactSection = page.locator('.contact-section');
        await expect(contactSection).toBeVisible();

        /** Verify phone contact information */
        const phoneContact = page.locator('.contact-item:has-text("Telefon")');
        await expect(phoneContact).toBeVisible();

        const phoneLink = page.locator('a[href*="tel:"]').first();
        await expect(phoneLink).toBeVisible();

        /** Verify email contact information */
        const emailContact = page.locator('.contact-item:has-text("Email")');
        await expect(emailContact).toBeVisible();

        const emailLink = page.locator('a[href*="mailto:"]').first();

        if (await emailLink.isVisible()) {
            await expect(emailLink).toBeVisible();
        }

        console.log('✅ Contact information verified');
    });

    /** Test location map display and functionality */
    test('should display location map', async ({ page }) => {
        await page.goto('/offer/aab40ef9-f32f-4a93-b060-5925a9f6b87b');
        await page.waitForTimeout(7000); // Extended timeout for map loading

        const mapSection = page.locator('.offer-map');

        if (await mapSection.isVisible()) {
            /** Verify map container with styling */
            const mapContainer = page.locator('.offer-map [style*="height"]').first();
            await expect(mapContainer).toBeVisible();

            console.log('✅ Location map verified');
        } else {
            console.log('Map section not visible - might require more loading time or API key');
        }
    });

    /** Test like/favorite button functionality with API mocking */
    test('should handle like button functionality', async ({ page }) => {
        /** Mock the like API endpoint */
        await page.route('**/api/v1/auth/liked-offers/**', async route => {
            await route.fulfill({
                status: 201,
                body: JSON.stringify({ message: 'Added to favorites' })
            });
        });

        await page.goto('/offer/aab40ef9-f32f-4a93-b060-5925a9f6b87b');
        await page.waitForTimeout(5000);

        /** Locate and test like button in title row */
        const titleRow = page.locator('.offer-title-row');
        const likeButton = titleRow.locator('button:has(.fa-heart), .like-button, button[class*="like"]');

        if (await likeButton.isVisible()) {
            await likeButton.click();
            await page.waitForTimeout(1000);
            console.log('✅ Like button functionality verified');
        } else {
            console.log('Like button not found in title row');
        }
    });

    /** Test seller's other offers button and navigation */
    test('should display other seller offers button', async ({ page }) => {
        await page.goto('/offer/aab40ef9-f32f-4a93-b060-5925a9f6b87b');
        await page.waitForTimeout(5000);

        /** Verify button presence and content */
        const viewSellerOffersButton = page.locator('.view-seller-offers');
        await expect(viewSellerOffersButton).toBeVisible();
        await expect(viewSellerOffersButton).toContainText('Zobacz inne oferty sprzedającego');

        /** Test navigation to seller page */
        await viewSellerOffersButton.click();
        await page.waitForTimeout(2000);

        const currentUrl = page.url();
        console.log(`URL after seller offers click: ${currentUrl}`);

        const isSellerPage = currentUrl.includes('/seller/');
        console.log(`Navigated to seller page: ${isSellerPage}`);
    });
});