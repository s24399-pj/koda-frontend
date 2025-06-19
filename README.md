# Koda - Car Marketplace Frontend

A modern, responsive web application for browsing and managing car listings. Built with React, TypeScript, and connected to the Koda backend API.

## Features

- **Browse Cars**: Search and filter through extensive car listings with advanced filters
- **Car Details**: View comprehensive car information with image galleries, specifications, and equipment
- **User Management**: Register, login, and manage your profile with authentication
- **Create Listings**: Add your own car listings with detailed information and photo uploads
- **Chat System**: Real-time messaging between buyers and sellers using WebSocket
- **Favorites**: Save and manage liked car offers
- **Car Comparison**: Compare up to 2 cars side by side with detailed specifications
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Search**: Dynamic search with auto-suggestions and advanced filtering

## Tech Stack

- **Framework**: React 19+ with TypeScript
- **Styling**: SCSS + Tailwind CSS 4.0
- **State Management**: React Context API (AuthContext, ComparisonContext)
- **HTTP Client**: Axios with custom authentication interceptors
- **Routing**: React Router DOM v7.2
- **Form Validation**: Formik + Yup
- **Build Tool**: Vite 6.0
- **Real-time Communication**: STOMP over WebSocket (@stomp/stompjs, sockjs-client)
- **Maps**: Leaflet for location display
- **Icons**: Lucide React + React Icons + FontAwesome
- **Image Carousel**: React Slick
- **Testing**: Tests will be implemented using Jest/Vitest + Testing Library

## Prerequisites

- Node.js 18+ and npm/yarn
- Koda Backend API running (default: http://localhost:8137)
- Modern web browser with ES6+ support

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/koda-frontend.git
cd koda-frontend

# Install dependencies
npm install
# or
yarn install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:8137
```

### Development

```bash
# Start development server
npm run dev
# or
yarn dev

# Open http://localhost:5173 in your browser
```

### Building for Production

```bash
# Build for production
npm run build
# or
yarn build

# Preview production build
npm run preview
# or
yarn preview
```

### Code Quality

```bash
# Format code
npm run format
# or check formatting
npm run format:check

# Lint code
npm run lint
# or fix linting issues
npm run lint:fix
```

## Project Structure

```
src/
├── api/                    # API service layer
│   ├── authApi.ts         # Authentication API calls
│   ├── offerApi.ts        # Car offers API calls
│   ├── chatApi.ts         # Chat/messaging API calls
│   ├── likedOfferApi.ts   # Liked offers API calls
│   ├── imageApi.ts        # Image upload API calls
│   ├── useInternalApi.ts  # User management API calls
│   └── axiosAuthClient.ts # Authenticated HTTP client
├── components/             # Reusable UI components
│   ├── AdvancedFilter/    # Search and filtering components
│   ├── Chat/              # Chat-related components
│   ├── ComparisonBar/     # Comparison functionality
│   ├── LikeButton/        # Like/favorite functionality
│   ├── OfferCreation/     # Multi-step offer creation
│   ├── RequireAuth/       # Authentication guards
│   └── [Other components]
├── pages/                  # Page components
│   ├── Home/              # Homepage with featured cars
│   ├── Offer/             # Individual car details page
│   ├── OfferList/         # Car listings with filters
│   ├── OfferCreation/     # Create new car listing
│   ├── OfferComparison/   # Compare cars side by side
│   ├── Auth/              # Login/Register pages
│   ├── UserPanel/         # User dashboard
│   ├── Chat/              # Real-time messaging
│   ├── LikedOffers/       # User's favorite cars
│   ├── SellerOffers/      # Seller's car listings
│   └── WhyUs/             # About/features page
├── context/               # React Context providers
│   ├── AuthContext.tsx    # Authentication state
│   └── ComparisonContext.tsx # Car comparison state
├── hooks/                 # Custom React hooks
│   └── useTitle.ts        # Dynamic page title management
├── types/                 # TypeScript type definitions
│   ├── auth/              # Authentication types
│   ├── chat/              # Chat/messaging types
│   ├── offer/             # Car offer types
│   └── user/              # User-related types
├── translations/          # Internationalization
│   └── carEquipmentTranslations.ts
├── routes/                # Application routing
│   └── Router.tsx
├── util/                  # Utility components
│   └── Providers.tsx      # Context providers wrapper
└── assets/                # Static assets (images, styles)
```

## API Integration

The frontend communicates with the Koda backend API through dedicated service modules:

### Core API Services

```typescript
// Authentication
export const login = (credentials: LoginCredentials): Promise<AuthResponse>
export const register = (credentials: RegisterCredentials): Promise<void>
export const logout = (): Promise<void>

// Car Offers
export const searchOffers = (filters?, pagination?): Promise<SearchResponse<MiniOffer>>
export const getOfferDetails = (id: string): Promise<OfferData>
export const createOffer = (offerData: CreateOfferCommand): Promise<string>
export const getOffersBySeller = (sellerId: string): Promise<MiniOffer[]>

// Chat System
export const chatService = {
  connect: () => Promise<void>
  sendMessage: (recipientId: string, content: string) => void
  getConversations: () => Promise<Conversation[]>
  getMessages: (recipientId: string) => Promise<ChatMessage[]>
}

// User Management
export const getUserProfile = (): Promise<UserProfile>
export const searchUsers = (query: string): Promise<UserMiniDto[]>

// Favorites
export const likedOfferApi = {
  getLikedOffers: () => Promise<MiniOffer[]>
  toggleLike: (offerId: string) => Promise<void>
}
```

## Key Features Implementation

### Authentication System

- JWT token-based authentication with automatic refresh
- Protected routes using `RequireAuth` component
- Persistent login state with local storage
- Automatic logout on token expiration

### Real-time Chat

- WebSocket connection using STOMP protocol
- Real-time message delivery and status updates
- Conversation management with message history
- User search and chat initiation

### Advanced Search & Filtering

- Multi-criteria search (brand, model, price, fuel type, etc.)
- Real-time search suggestions
- Pagination with optimized loading
- Filter persistence and URL state management

### Car Comparison

- Side-by-side comparison of up to 2 cars
- Detailed specification comparison
- Visual differences highlighting
- Session storage for comparison state

### Image Management

- Multiple image upload for car listings
- Image carousel with lightbox view
- Responsive image galleries
- Error handling with fallback images

## Component Examples

### Car Card Component

```tsx
const CarCard: React.FC<{ offer: MiniOffer }> = ({ offer }) => {
  return (
    <div className="car-card">
      <img src={`${API_URL}${offer.mainImage}`} alt={offer.title} onError={handleImageError} />
      <div className="car-info">
        <h3>{offer.title}</h3>
        <p className="price">{formatPrice(offer.price, offer.currency)}</p>
        <div className="specs">
          <span>{offer.year}</span>
          <span>{formatMileage(offer.mileage)}</span>
          <span>{getTranslation('fuelTypes', offer.fuelType)}</span>
          <span>{offer.enginePower} HP</span>
        </div>
      </div>
      <div className="actions">
        <LikeButton offerId={offer.id} />
        <CompareCheckbox offerId={offer.id} />
      </div>
    </div>
  );
};
```

### Advanced Filter Component

```tsx
const AdvancedFilter: React.FC = ({ onSearch, onLoading }) => {
  const [filters, setFilters] = useState<FilterState>({});
  const [brands, setBrands] = useState<string[]>([]);

  const handleSearch = () => {
    onLoading(true);
    offerApiService
      .searchOffers(filters)
      .then(onSearch)
      .finally(() => onLoading(false));
  };

  return (
    <div className="advanced-filter">
      <input
        type="text"
        placeholder="Search cars..."
        onChange={e => setFilters(prev => ({ ...prev, phrase: e.target.value }))}
      />
      <select onChange={e => setFilters(prev => ({ ...prev, brand: e.target.value }))}>
        <option value="">All Brands</option>
        {brands.map(brand => (
          <option key={brand} value={brand}>
            {brand}
          </option>
        ))}
      </select>
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};
```

## State Management

The application uses React Context for global state management:

### Authentication Context

```tsx
const AuthContext = createContext<{
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  validateToken: () => Promise<boolean>;
}>();
```

### Comparison Context

```tsx
const ComparisonContext = createContext<{
  selectedOffers: MiniOffer[];
  addToComparison: (offer: MiniOffer) => void;
  removeFromComparison: (id: string) => void;
  canAddMoreOffers: () => boolean;
}>();
```

## Testing

Testing infrastructure is set up but tests are not yet implemented. The planned testing approach includes:

```bash
# When tests are implemented, run with:
npm test
# or
yarn test
```

## Deployment

### Environment-Specific Builds

The application supports different build configurations through environment variables:

```bash
# Development
VITE_API_URL=http://localhost:8137 npm run build

# Staging
VITE_API_URL=https://api-staging.koda.com npm run build

# Production
VITE_API_URL=https://api.koda.com npm run build
```

## Development Tools

### ESLint Configuration

- TypeScript ESLint rules
- React hooks linting
- Prettier integration
- Custom rules for code quality

### Prettier Configuration

- Consistent code formatting
- SCSS and TypeScript support
- Integration with ESLint

## Performance Optimization

- Code splitting with React Router
- Lazy loading of images
- Optimized API calls with caching
- Responsive image loading
- Bundle optimization with Vite

## Security Features

- JWT token validation
- XSS protection
- CSRF protection through API design
- Secure file upload validation
- Input sanitization
