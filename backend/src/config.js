import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: Number(process.env.PORT) || 4000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  udupayApiUrl:
    process.env.UDUPAY_API_URL || 'http://localhost:5001/api/merchant/checkout-sessions',
  udupayPublicKey: process.env.UDUPAY_PUBLIC_KEY || '',
  udupaySecretKey: process.env.UDUPAY_SECRET_KEY || '',
  udupayPreviewUrlTemplate:
    process.env.UDUPAY_PREVIEW_URL_TEMPLATE ||
    'http://localhost:5001/api/payments/checkout-sessions/{redirectToken}',
}
