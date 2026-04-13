# Simple E-commerce Test Store

Small React + Node.js app for testing a checkout flow with a future UduPay BNPL integration.

## Run it

1. Install everything:

   ```bash
   npm install
   npm run install:all
   ```

2. Copy environment examples if you want custom URLs:

   ```bash
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   ```

3. Start frontend and backend together:

   ```bash
   npm run dev
   ```

Frontend: `http://localhost:5173`

Backend: `http://localhost:4000`

## Deploy

Deploy the frontend to Vercel with:

```bash
Root Directory: frontend
Install Command: npm install
Build Command: npm run build
Output Directory: dist
VITE_API_BASE_URL=https://your-backend-url.onrender.com
```

Deploy the backend to Render with:

```bash
Root Directory: backend
Build Command: npm install
Start Command: npm start
FRONTEND_URL=https://your-frontend-url.vercel.app
FRONTEND_URLS=https://your-frontend-url.vercel.app
```

`FRONTEND_URLS` can contain a comma-separated list if you want to allow multiple frontend domains, such as a production Vercel domain and a preview/custom domain.

## UduPay later

The backend already reads UduPay settings from `backend/.env`.

Use `backend/.env` for your real merchant config. The tracked example keeps secret values empty:

```bash
UDUPAY_API_URL=http://localhost:5001/api/merchant/checkout-sessions
UDUPAY_PUBLIC_KEY=
UDUPAY_SECRET_KEY=
UDUPAY_PREVIEW_URL_TEMPLATE=http://localhost:5001/api/payments/checkout-sessions/{redirectToken}
UDUPAY_APP_REDIRECT_PATTERN=exp://172.20.10.2:8081/--/checkout/{redirectToken}
UDUPAY_SIMULATOR_APP_REDIRECT_PATTERN=exp://127.0.0.1:8081/--/checkout/{redirectToken}
UDUPAY_NATIVE_APP_PATTERN=bnplv1://checkout/{redirectToken}
UDUPAY_WEBHOOK_URL=http://localhost:5001/api/merchant/webhooks/payments
```
