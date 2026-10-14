# Smart Parking frontend

React 19 and Vite 8 client for the Smart Parking Management System.

See the [project README](../README.md) for installation, API configuration, parking rules, and deployment.

```sh
npm ci
npm run dev
npm run lint
npm test
npm run build
```

Development uses port 5173 and proxies `/api` to port 8080. Set `VITE_API_BASE_URL` at build time for a separately hosted backend. The production output is `dist/`.
