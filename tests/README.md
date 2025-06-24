# PWA Testing Suite

Complete E2E test suite for React applications using Playwright. Contains **68 functional tests** and **90 monkey/chaos tests** to ensure application stability.

## Functional Tests

Functional tests verifying main user flows:

### Authentication Flow
- Navigation to login page
- New user registration with validation
- Login - correct and incorrect credentials
- Form validation error handling
- Redirects for unauthorized users
- RequireAuth component for protected pages
- Cross-browser compatibility testing

### Offers Flow
- Display offer list with proper structure
- Car technical data (year, mileage, fuel, power)
- Like button functionality
- Offer comparison system (Compare Checkbox)
- Navigation to single offer
- Results pagination
- No results state
- Loading states and error handling
- Image loading error handling

### Single Offer Details
- Offer header with image gallery and basic information
- Image gallery with thumbnails and navigation
- Lightbox - image zoom with full functionality
- Detailed technical specifications
- Car equipment section
- Seller information and profile
- Chat button functionality (with authorization handling)
- Contact information
- Location map
- "View other seller's offers" button

## Non-Functional Tests

### Chaos Testing
- **Gremlins.js Integration**: Random UI interactions (300 actions in 15s)
- **Multi-page Chaos**: Testing across different application pages
- **Simple Chaos**: Clicking without external libraries
- **Navigation Chaos**: Random navigation between pages
- **Form Chaos**: Intensive form testing
- **Scroll Chaos**: Random scrolling
- **Keyboard Chaos**: Random text input

### Stress Testing
- **Safe Navigation Stress**: Fast navigation with error handling
- **Form Interaction Stress**: Multiple form submissions
- **Browser Navigation**: Back/forward button testing
- **Intensive Clicking**: Mass element clicking (14-37 clicks)
- **Rapid Page Reload**: Fast page reloading
- **Scroll Stress**: Intensive scrolling
- **Keyboard Input Stress**: Fast typing
- **Multi-tab Simulation**: Multiple tab simulation
- **Memory Stress**: DOM memory management testing

### Network Chaos Testing
- **Random API Failures**: 40% failure rate for requests
- **Slow Network Simulation**: 0.5-2.5s delays
- **Intermittent Connectivity**: Interrupted connection every 4 requests
- **API Timeout Simulation**: Request timeout testing
- **Error Code Variety**: 404, 500, network failures

### Memory Leak Detection
- **Navigation Memory Monitoring**: 5 cycles × 4 pages
- **Component Mounting**: 10× reload with memory monitoring
- **Form Interactions**: 50 fill/clear cycles
- **Event Listeners**: Testing 100+ event handlers
- **Garbage Collection**: Forced memory cleanup

### UI Chaos Testing
- **Random Clicks**: Random clicking on interactive elements
- **Random Scrolling**: Chaotic scrolling for 15s
- **Keyboard Input Chaos**: Random character input
- **Focus/Blur Events**: Random element focusing
- **Drag & Drop Chaos**: Random element dragging
- **Window Resize**: Window resizing (320px-1920px)

## Running Tests

### All Tests
```bash
# All E2E tests with HTML report
npm run test:e2e-ui

# All tests without auto-report
npm run test:e2e
```

### Functional Tests
```bash
# All functional tests
npm run test:functional-only

# Specific categories only
npx playwright test tests/functional/auth.spec.ts
npx playwright test tests/functional/offers-precise.spec.ts  
npx playwright test tests/functional/single-offer-precise.spec.ts
```

### Monkey Tests (Non-functional)
```bash
# All monkey tests
npm run test:monkey-only

# Individual test types
npm run test:chaos
npm run test:stress
npm run test:network
npm run test:memory
npm run test:ui-chaos
```

### Reports and Tools
```bash
# Show HTML report
npm run test:report

# Debug mode
npm run test:e2e-debug

# With visible browser
npm run test:e2e-headed

# Specific browser
npm run test:chrome
npm run test:mobile

# Clean old reports
npm run test:clean
```