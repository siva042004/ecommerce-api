# ShopForge — React Frontend

Modern, dark-themed e-commerce frontend for the Spring Boot backend.

## Design System
- **Font**: Syne (display/headings) + DM Sans (body)
- **Theme**: Dark mode — near-black backgrounds, acid-yellow accent (#e8ff47)
- **Style**: Clean dark card UI with subtle borders, smooth animations, skeleton loading

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Auth | Login & Register with JWT |
| `/` | Dashboard | Stats, recent orders, featured products |
| `/products` | Products | Browse, search, filter by category; add to cart |
| `/categories` | Categories | Grid view; Admin can CRUD |
| `/orders` | My Orders | Expandable cards with order timeline |
| `/checkout` | Checkout | 2-step: address → payment method |
| `/payments` | Payments | Payment history table |
| `/admin/orders` | Admin Orders | Status management (Admin only) |

## Features
- JWT auth with auto-refresh & logout on 401
- Cart drawer with real-time quantity updates
- Role-based UI (Admin sees extra controls)
- Demo data fallback when API is offline
- Skeleton loaders on all async pages
- Toast notifications
- Fully responsive

## Quick Start

```bash
npm install
npm start
# Frontend: http://localhost:3000
# Connects to Spring Boot backend on :8080
```

## Production Build

```bash
npm run build
# Outputs to /build — deploy to Netlify, Vercel, or Render Static Sites
```

### Deploy to Netlify (free)
1. `npm run build`
2. Drag `/build` folder to [netlify.com/drop](https://netlify.com/drop)
3. Set env var `REACT_APP_API_URL=https://your-api.onrender.com`

### Deploy to Vercel (free)
```bash
npx vercel --prod
```
Set `REACT_APP_API_URL` in Vercel dashboard.

## Tech Stack
- React 18 + React Router 6
- Zustand (state management)
- Axios (API client, with JWT interceptor)
- react-hot-toast (notifications)
- Lucide React (icons)
- Custom CSS design system (no Tailwind, no MUI — pure CSS variables)
