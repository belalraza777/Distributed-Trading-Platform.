
# Trading Platform Client

The client is a Next.js 16 application for the trading platform. It runs on port `8000` and calls the API gateway at `http://localhost:3000` by default.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:8000`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js development server on port 8000 |
| `npm run build` | Build the production client |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Configuration

The HTTP services are defined in `services/Axios.ts` and the market Socket.IO connection is defined in `lib/socket.ts`. Run the gateway on port `3000` before using authenticated or market-data features. The market-data service allows the frontend origin `http://localhost:8000` by default.

The application uses JWT authentication, Zustand stores, Axios service modules, and Socket.IO for live market price updates.
