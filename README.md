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
