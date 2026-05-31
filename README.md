# Green Thumb Subscription PWA

A Progressive Web App for seasonal plant subscriptions and care guidance, built by SALTEDHASH.

## Tech Stack
- Frontend: React + Vite + Workbox (vite-plugin-pwa)
- Backend: Node.js + Express
- Database: JSON local file storage (simulated/demo)

## Installation

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

## Running the App

Run both the frontend and backend servers to use the app completely.

```bash
# Terminal 1 - Backend Server (runs on port 3000)
cd backend
node server.js

# Terminal 2 - Frontend Dev Server
cd frontend
npm run dev

# To build the frontend for production
cd frontend
npm run build
```

## Default Demo Credentials
The backend uses a simulated base64/mock JWT auth system. **Note: This local JWT/mock auth is for demo purposes only and should not be used in production.**

- **Admin User**: `admin@saltedhash.com` / `Admin@1234`
- **Subscriber User**: `user@saltedhash.com` / `User@1234`

## Routes

### Frontend
- `/` : Home - Browse seasonal boxes and featured guides.
- `/boxes/:id` : Box Details - View plants in a box and subscribe.
- `/guides` : Guides - Searchable list of plant care guides.
- `/guides/:id` : Guide Detail - Read care instructions and save offline.
- `/subscribe/:boxId?` : Subscribe - Submit a new subscription.
- `/dashboard` : Dashboard (Auth required) - View active subscriptions and access related guides.
- `/admin` : Admin Panel (Admin role required) - Manage boxes, guides, subscriptions, and view the audit log.
- `/login` : Login
- `/403` : Forbidden - Shown when unauthorized access is attempted.

### Backend API
- `GET /api/boxes` - List all boxes
- `GET /api/boxes/:id` - Get single box
- `GET /api/guides` - List all guides (supports `?plantName=` filter)
- `GET /api/guides/:id` - Get single guide
- `POST /api/subscriptions` - Create new subscription
- `GET /api/subscriptions` - List subscriptions (Admin)
- `PATCH /api/subscriptions/:id/status` - Update subscription status (Admin)
- `POST /api/auth/login` - Login to receive demo token
- `POST /api/auth/register` - Register a new user
- `GET /api/users/:id/subscriptions` - Get user's subscriptions
- `GET /api/admin/audit` - Get audit log (Admin)
- `POST /api/admin/seed` - Seed database (Admin)

## Offline Capabilities

Because this app is a PWA, it supports significant offline capabilities:
1. **Caching**: Core assets (JS, CSS, images) and visited API responses are cached via Workbox `NetworkFirst`, `CacheFirst`, and `StaleWhileRevalidate` strategies.
2. **Dashboard**: Visiting the dashboard caches your subscription details locally. If you go offline, you will see a badge indicating you are viewing offline data.
3. **Save Guides Offline**: From any guide detail page, you can explicitly click "Save Offline" to persist that guide to `localStorage`.
4. **Subscription Queue Replay**: If you attempt to submit a subscription while offline, it gets saved to an offline queue. When your device comes back online, the app automatically replays and flushes the queue in the background.

## Database Seeding
To reset or generate seed data:
1. Login as an Admin (`admin@saltedhash.com`).
2. Go to the Admin panel (`/admin`).
3. Click the "Seed Seasonal Box Examples and Guides" button. This will wipe and repopulate `boxes.json` and `guides.json` with sample data.

## PWA Installation
When visiting the app in a supported browser (like Chrome or Edge), an "Install our app" banner will appear. Click "Add to Home Screen" to install it locally.
