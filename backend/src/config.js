import dotenv from 'dotenv'

dotenv.config()

function parseFrontendUrls(value) {
  return (value || '')
    .split(',')
    .map((url) => url.trim().replace(/\/$/, ''))
    .filter(Boolean)
}

export const config = {
  port: Number(process.env.PORT) || 4000,
  frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, ''),
  frontendUrls: parseFrontendUrls(process.env.FRONTEND_URLS),
  udupayApiUrl:
    process.env.UDUPAY_API_URL || 'http://localhost:5001/api/merchant/checkout-sessions',
  udupayPublicKey: process.env.UDUPAY_PUBLIC_KEY || '',
  udupaySecretKey: process.env.UDUPAY_SECRET_KEY || '',
  udupayPreviewUrlTemplate:
    process.env.UDUPAY_PREVIEW_URL_TEMPLATE ||
    'http://localhost:5001/api/payments/checkout-sessions/{redirectToken}',
}
