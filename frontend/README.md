# Frontend Applications

This directory contains all frontend applications for the e-commerce platform.

## 📱 Applications

| Application | Port | Framework | Description |
|------------|------|-----------|-------------|
| **main** | 3000 | Next.js 14 | Main customer-facing website |
| **admin** | 9000 | React + Vite | Admin dashboard |
| **dealer** | 5174 | React + Vite | Dealer management portal |

## 🏗️ Architecture

All frontend applications follow a **consistent architecture pattern**:

### Deployment Architecture
```
Browser → Nginx (Port 80) → /api/* → API Gateway (8080)
                          → /* → Frontend App (React/Next.js)
```

- **Nginx**: Reverse proxy for API requests and static file serving
- **API Proxy**: `/api/*` routes to backend API Gateway
- **Static Serving**: React/Next.js build output

## 🛠️ Technology Stack

### Main (Customer Website)
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **API Client**: Axios
- **Deployment**: Nginx + Node.js (via Supervisor)
- **Features**: SSR, ISR, Image optimization

### Admin Dashboard
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **UI Library**: shadcn/ui, Radix UI
- **Routing**: React Router
- **Forms**: React Hook Form
- **Charts**: Recharts
- **Deployment**: Nginx (static)

### Dealer Portal
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **UI Library**: shadcn/ui, Radix UI
- **Routing**: React Router
- **Forms**: React Hook Form
- **Deployment**: Nginx (static)

## 📂 Project Structure

### Common Structure (All Apps)

```
app-name/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/ (or app/)# Routes/Pages
│   ├── services/       # API service layer
│   ├── context/        # React Context providers
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── constants/      # App constants
│   └── config/         # App configuration
├── public/             # Static assets
├── Dockerfile          # Production Docker image
├── nginx.conf          # Nginx configuration
├── package.json
└── tsconfig.json (or vite.config.ts)
```

### Main (Next.js) Specific

```
main/
├── src/
│   ├── app/           # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── [routes]/
│   ├── components/
│   ├── services/
│   └── ...
├── supervisord.conf   # Supervisor config (Nginx + Next.js)
└── next.config.ts
```

## 🚀 Development

### Prerequisites

- Node.js 20+
- npm or yarn
- Docker (for containerized development)

### Install Dependencies

```bash
cd app-name
npm install
```

### Development Server

#### Main (Next.js)
```bash
cd main
npm run dev
# Opens at http://localhost:3000
```

#### Admin Dashboard
```bash
cd admin
npm run dev
# Opens at http://localhost:5173 (Vite default)
```

#### Dealer Portal
```bash
cd dealer
npm run dev
# Opens at http://localhost:5174
```

### Build for Production

```bash
npm run build
```

### Run Production Build Locally

#### Main (Next.js)
```bash
npm run start
```

#### Admin/Dealer (Vite)
```bash
npm run preview
```

## 🐳 Docker Deployment

### Main (Next.js + Nginx)

**Multi-service setup** with Supervisor:
```dockerfile
# Runs both:
# - Next.js server (localhost:3000)
# - Nginx (port 80) → proxies to Next.js
```

### Admin/Dealer (Vite + Nginx)

**Static build** served by Nginx:
```dockerfile
# Build stage: npm run build
# Production: nginx serves dist/
```

### Run with Docker Compose

From project root:
```bash
# All frontends
docker-compose up main-frontend admin-frontend dealer-frontend

# Individual frontend
docker-compose up main-frontend
```

## 🔧 Configuration

### Environment Variables

#### Main (Next.js)
Not needed - API calls use `/api` prefix (proxied by Nginx)

#### Admin
```env
VITE_API_BASE_URL=/api
```

#### Dealer
```env
VITE_API_BASE_URL=/api
```

### Nginx Configuration

All apps use Nginx for:
- **API Proxy**: `/api/*` → `http://api-gateway:8080/api/*`
- **Static Caching**: 1 year cache for assets
- **Gzip Compression**: Enabled
- **SPA Routing**: Fallback to `index.html`

Example (admin/dealer):
```nginx
location /api/ {
    proxy_pass http://api-gateway:8080/api/;
    # ... proxy headers
}

location / {
    try_files $uri $uri/ /index.html;  # SPA routing
}
```

Main (Next.js) proxies to localhost:3000:
```nginx
upstream nextjs {
    server localhost:3000;
}

location / {
    proxy_pass http://nextjs;
}
```

## 🎨 UI Components

### Admin & Dealer

Use **shadcn/ui** component library:
- Pre-built, customizable components
- Tailwind CSS based
- Radix UI primitives
- Located in `src/components/ui/`

Add components:
```bash
npx shadcn-ui@latest add button
```

### Main (Customer Site)

Custom components with:
- Tailwind CSS
- Framer Motion (animations)
- Next.js Image optimization
- Responsive design

## 📡 API Integration

### Service Layer Pattern

All apps use dedicated service layers:

```typescript
// src/services/apiService.ts
class ApiService {
    async fetchProducts() {
        return axios.get('/api/product/products');
    }
}

export const apiService = new ApiService();
```

### API Base URL

- **Development**: Direct API calls via dev server proxy
- **Production**: `/api/*` proxied by Nginx to API Gateway

### Request Flow

```
Frontend → Nginx (/api/*) → API Gateway (8080) → Microservices
```

## 🔐 Authentication

### JWT Token Flow

1. **Login**: `POST /api/auth/login` → Returns JWT
2. **Storage**: localStorage/sessionStorage
3. **Requests**: `Authorization: Bearer <token>` header
4. **Refresh**: `POST /api/auth/refresh` when token expires
5. **Logout**: `POST /api/auth/logout` + clear storage

### Protected Routes

#### Next.js (main)
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
    const token = request.cookies.get('token');
    if (!token) return NextResponse.redirect('/login');
}
```

#### React (admin/dealer)
```typescript
// Protected route wrapper
<PrivateRoute>
    <AdminDashboard />
</PrivateRoute>
```

## 🎯 Features

### Main (Customer Website)
- Product catalog with search
- Shopping cart
- Order tracking
- Warranty check
- Dealer locator
- Blog/News
- Responsive design

### Admin Dashboard
- User management
- Product CRUD
- Order management
- Dealer approval
- Analytics & reports
- Blog management

### Dealer Portal
- Inventory management
- Order processing
- Customer management
- Sales reports
- Profile management

## 📱 Responsive Design

All apps support:
- **Desktop**: 1920px+
- **Tablet**: 768px - 1919px
- **Mobile**: < 768px

Breakpoints (Tailwind):
```css
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests (if configured)
```bash
npm run test:e2e
```

## 🚀 Performance Optimization

### Main (Next.js)
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic
- **SSR/ISR**: Server-side rendering
- **Caching**: Nginx + Next.js cache

### Admin/Dealer (Vite)
- **Code Splitting**: Dynamic imports
- **Tree Shaking**: Vite optimization
- **Asset Optimization**: Build-time compression
- **Caching**: Nginx cache headers

## 📝 Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for React/Next.js
- **Prettier**: Auto-formatting (if configured)
- **Naming**: camelCase for variables, PascalCase for components

## 🔄 State Management

### Global State
- **React Context**: User auth, theme, language
- **Custom Hooks**: useAuth, useCart, etc.

### Server State
- **React Query** (if used): Server data caching
- **SWR** (if used): Data fetching

### Form State
- **React Hook Form**: Form validation
- **Zod**: Schema validation

## 📚 Additional Resources

- API Documentation: http://localhost:8080/swagger-ui.html
- Main project overview: `../PROJECT_OVERVIEW.md`
- Backend services: `../backend/README.md`
