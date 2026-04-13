import cors from 'cors'
import express from 'express'
import { config } from './config.js'
import { products } from './data/products.js'

const app = express()

function getAllowedOrigins() {
  return [
    config.frontendUrl,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://localhost:5178',
  ]
}

function buildPreviewUrl(redirectToken) {
  return config.udupayPreviewUrlTemplate.replace('{redirectToken}', redirectToken)
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true)
        return
      }

      const allowedOrigins = getAllowedOrigins()

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }

      callback(new Error(`Origin ${origin} not allowed by CORS`))
    },
  }),
)
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({ ok: true })
})

app.get('/api/products', (_request, response) => {
  response.json({ products })
})

app.post('/api/checkout', async (request, response) => {
  const { customer, items, paymentMethod } = request.body

  if (!customer?.fullName || !customer?.email) {
    return response.status(400).json({
      message: 'Customer name and email are required.',
    })
  }

  if (!Array.isArray(items) || items.length === 0) {
    return response.status(400).json({
      message: 'At least one cart item is required.',
    })
  }

  if (paymentMethod !== 'udupay') {
    return response.status(400).json({
      message: 'Unsupported payment method.',
    })
  }

  const orderItems = items
    .map((item) => {
      const product = products.find((entry) => entry.id === item.id)

      if (!product) {
        return null
      }

      return {
        ...product,
        quantity: Number(item.quantity) || 0,
      }
    })
    .filter(Boolean)
    .filter((item) => item.quantity > 0)

  if (!orderItems.length) {
    return response.status(400).json({
      message: 'No valid items were provided.',
    })
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 12
  const total = subtotal + shipping
  const isConfigured = Boolean(
    config.udupayApiUrl && config.udupayPublicKey && config.udupaySecretKey,
  )

  if (!isConfigured) {
    return response.status(500).json({
      message: 'UduPay merchant configuration is missing in backend/.env.',
    })
  }

  const orderReference = `order-${Date.now()}`
  const itemTitle =
    orderItems.length === 1 ? orderItems[0].name : `${orderItems[0].name} + ${orderItems.length - 1} more`
  const itemDescription = orderItems
    .map((item) => `${item.quantity} x ${item.name}`)
    .join(', ')
    .slice(0, 255)
  const origin = getAllowedOrigins().includes(request.headers.origin) ? request.headers.origin : config.frontendUrl

  try {
    const providerResponse = await fetch(config.udupayApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-merchant-key': config.udupayPublicKey,
        'x-merchant-secret': config.udupaySecretKey,
      },
      body: JSON.stringify({
        orderReference,
        itemTitle,
        itemDescription,
        amount: total,
        currency: 'AUD',
        customerReference: customer.email,
        successUrl: `${origin}/success`,
        cancelUrl: `${origin}/cancel`,
      }),
    })

    const providerPayload = await providerResponse.json().catch(() => null)

    if (!providerResponse.ok) {
      return response.status(providerResponse.status).json({
        message: providerPayload?.message || 'Failed to create UduPay checkout session.',
        providerPayload,
      })
    }

    const checkoutSession = providerPayload?.data?.checkoutSession

    return response.status(201).json({
      checkoutId: checkoutSession?.id,
      status: checkoutSession?.status || 'pending',
      paymentMethod: 'udupay',
      totals: {
        subtotal,
        shipping,
        total,
      },
      customer,
      orderItems,
      redirectToken: checkoutSession?.redirectToken || null,
      previewUrl: checkoutSession?.redirectToken
        ? buildPreviewUrl(checkoutSession.redirectToken)
        : null,
      appRedirectUrl: checkoutSession?.appRedirectUrl || null,
      nativeAppRedirectUrl: checkoutSession?.nativeAppRedirectUrl || null,
      providerCheckoutSession: checkoutSession || null,
    })
  } catch (error) {
    return response.status(502).json({
      message: error.message || 'Unable to reach UduPay checkout service.',
    })
  }
})

app.listen(config.port, () => {
  console.log(`Backend running on http://localhost:${config.port}`)
})
