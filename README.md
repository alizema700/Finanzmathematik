# DealMind Prototype

This repository contains a single-page React experience for exploring simulated M&A intelligence. The UI is built with Vite and React, styled using Tailwind classes via CDN, and showcases components such as dashboards, company profiles, workspaces, signal radar, modeling tools, and a watchlist. A lightweight Express backend exposes the simulated datasets so you can run the entire prototype locally without plugging in external services.

## Running locally

Install dependencies and start both the backend API and Vite dev server:

```bash
npm install
npm run dev
```

The frontend proxies `/api` calls to the Express server running on port 5000. To build for production and serve the compiled SPA from Express, run:

```bash
npm run build
npm start
```

If you do not have npm available in your environment, install Node.js 18+ first.
