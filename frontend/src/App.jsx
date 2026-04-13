import { useEffect, useState } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

const demoProducts = [
  {
    id: 'wireless-headphones',
    shortName: 'WH',
    name: 'Wireless Headphones',
    description: 'Easy sample item for checking cart totals and BNPL checkout flow.',
    price: 149,
  },
  {
    id: 'smart-watch',
    shortName: 'SW',
    name: 'Smart Watch',
    description: 'Another product with a different price point for testing installments.',
    price: 219,
  },
  {
    id: 'portable-speaker',
    shortName: 'PS',
    name: 'Portable Speaker',
    description: 'Simple accessory item to make multi-product orders easy to simulate.',
    price: 89,
  },
]

const highlights = [
  'Free shipping over $120',
  'Fast sandbox checkout testing',
  'Simple UduPay button flow',
]

const categories = ['Headphones', 'Wearables', 'Speakers', 'Accessories']

const trustPoints = [
  { title: 'Express delivery', text: 'Demo orders ship in 2-4 days for checkout testing.' },
  { title: 'Easy returns', text: 'Mock return messaging to make the store feel realistic.' },
  { title: 'BNPL ready', text: 'UduPay is featured directly in the payment area.' },
]

const defaultCheckoutForm = {
  fullName: '',
  email: '',
  address: '',
  city: '',
  country: '',
}

function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState({})
  const [checkoutForm, setCheckoutForm] = useState(defaultCheckoutForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [catalogMessage, setCatalogMessage] = useState('')
  const [checkoutResult, setCheckoutResult] = useState(null)

  useEffect(() => {
    let ignore = false

    async function loadProducts() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products`)
        if (!response.ok) {
          throw new Error('Unable to load products from the API.')
        }

        const data = await response.json()
        const nextProducts = Array.isArray(data.products) && data.products.length > 0
          ? data.products
          : demoProducts

        if (!ignore) {
          setProducts(nextProducts)
          setCatalogMessage(
            nextProducts === demoProducts
              ? 'Showing built-in demo products for testing because the live catalog is unavailable.'
              : '',
          )
        }
      } catch {
        if (!ignore) {
          setProducts(demoProducts)
          setCatalogMessage(
            'Showing built-in demo products for testing because the live catalog could not be loaded.',
          )
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      ignore = true
    }
  }, [])

  const cartItems = products
    .map((product) => ({
      ...product,
      quantity: cart[product.id] ?? 0,
    }))
    .filter((product) => product.quantity > 0)

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const shipping = cartItems.length > 0 ? 12 : 0
  const total = subtotal + shipping

  function changeQuantity(productId, nextQuantity) {
    setCart((currentCart) => {
      const updatedCart = { ...currentCart }

      if (nextQuantity <= 0) {
        delete updatedCart[productId]
        return updatedCart
      }

      updatedCart[productId] = nextQuantity
      return updatedCart
    })
  }

  function handleFormChange(event) {
    const { name, value } = event.target
    setCheckoutForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  async function handleCheckout(event) {
    event.preventDefault()

    if (!cartItems.length) {
      setMessage('Add at least one item before testing the payment flow.')
      return
    }

    setSubmitting(true)
    setMessage('')
    setCheckoutResult(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: checkoutForm,
          items: cartItems.map(({ id, quantity }) => ({ id, quantity })),
          paymentMethod: 'udupay',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Checkout failed.')
      }

      setCheckoutResult(data)
      setMessage('UduPay checkout session created successfully.')
    } catch (error) {
      setMessage(error.message || 'Checkout failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="storefront">
      <div className="top-strip">
        {highlights.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>

      <header className="store-header">
        <div className="brand-lockup">
          <div className="brand-mark">U</div>
          <div>
            <p className="brand-name">UduPay Demo Store</p>
            <span className="brand-subtitle">Simple ecommerce frontend for BNPL testing</span>
          </div>
        </div>

        <nav className="main-nav">
          <a href="#shop">Shop</a>
          <a href="#benefits">Why us</a>
          <a href="#checkout">Checkout</a>
        </nav>

        <div className="header-cart">
          <span>{itemCount} items</span>
          <strong>{currency.format(total)}</strong>
        </div>
      </header>

      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Featured drop</p>
          <h1>Tech essentials with a cleaner checkout test flow</h1>
          <p className="hero-text">
            This version is styled like a lightweight online store so your UduPay payment option
            feels more natural during checkout testing.
          </p>

          <div className="hero-actions">
            <a className="hero-button" href="#shop">
              Shop now
            </a>
            <a className="hero-link" href="#checkout">
              Jump to checkout
            </a>
          </div>

          <div className="category-row">
            {categories.map((category) => (
              <span key={category}>{category}</span>
            ))}
          </div>
        </div>

        <div className="hero-showcase">
          <div className="showcase-card large">
            <p>Weekend audio pick</p>
            <strong>Wireless Headphones</strong>
            <span>Comfort fit, premium finish</span>
          </div>
          <div className="showcase-grid">
            <div className="showcase-card">
              <p>Smart gear</p>
              <strong>Wearables</strong>
            </div>
            <div className="showcase-card accent">
              <p>Pay later</p>
              <strong>UduPay at checkout</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="benefit-grid" id="benefits">
        {trustPoints.map((point) => (
          <article className="benefit-card" key={point.title}>
            <p className="eyebrow">Store promise</p>
            <h3>{point.title}</h3>
            <p>{point.text}</p>
          </article>
        ))}
      </section>

      <main className="content-grid">
        <section className="catalog-column" id="shop">
          <div className="section-head">
            <div>
              <p className="eyebrow">Best sellers</p>
              <h2>Popular products</h2>
            </div>
            <span className="section-meta">{products.length} products ready to test</span>
          </div>

          {loading ? <p>Loading products...</p> : null}
          {catalogMessage ? <p className="catalog-message">{catalogMessage}</p> : null}

          <div className="product-grid">
            {products.map((product, index) => {
              const quantity = cart[product.id] ?? 0

              return (
                <article className="product-card" key={product.id}>
                  <div className={`product-media tone-${(index % 3) + 1}`}>
                    <span>{product.shortName}</span>
                  </div>

                  <div className="product-content">
                    <div className="product-meta">
                      <span className="pill-tag">In stock</span>
                      <span className="price">{currency.format(product.price)}</span>
                    </div>

                    <h3>{product.name}</h3>
                    <p>{product.description}</p>

                    <div className="product-footer">
                      <div className="quantity-control">
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => changeQuantity(product.id, quantity - 1)}
                          disabled={quantity === 0}
                        >
                          -
                        </button>
                        <span>{quantity}</span>
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => changeQuantity(product.id, quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => changeQuantity(product.id, quantity + 1)}
                      >
                        Add to cart
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <aside className="checkout-column" id="checkout">
          <div className="panel cart-panel sticky-card">
            <div className="section-head compact">
              <div>
                <p className="eyebrow">Your cart</p>
                <h2>Order summary</h2>
              </div>
            </div>

            {cartItems.length === 0 ? (
              <p className="muted">Your cart is empty. Add a few products to test checkout.</p>
            ) : (
              <div className="cart-list">
                {cartItems.map((item) => (
                  <div className="cart-row" key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <p>
                        {item.quantity} x {currency.format(item.price)}
                      </p>
                    </div>
                    <span>{currency.format(item.quantity * item.price)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="totals">
              <div>
                <span>Subtotal</span>
                <strong>{currency.format(subtotal)}</strong>
              </div>
              <div>
                <span>Shipping</span>
                <strong>{currency.format(shipping)}</strong>
              </div>
              <div className="grand-total">
                <span>Total</span>
                <strong>{currency.format(total)}</strong>
              </div>
            </div>

            <div className="payment-box">
              <p className="eyebrow">Payment method</p>
              <div className="payment-choice">
                <div>
                  <strong>Pay with UduPay</strong>
                  <p>BNPL placeholder for your future API connection.</p>
                </div>
                <span className="payment-chip">BNPL</span>
              </div>
            </div>
          </div>

          <form className="panel checkout-panel" onSubmit={handleCheckout}>
            <div className="section-head compact">
              <div>
                <p className="eyebrow">Checkout</p>
                <h2>Customer details</h2>
              </div>
            </div>

            <div className="form-grid">
              <label>
                Full name
                <input
                  name="fullName"
                  value={checkoutForm.fullName}
                  onChange={handleFormChange}
                  placeholder="John Smith"
                  required
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  value={checkoutForm.email}
                  onChange={handleFormChange}
                  placeholder="john@example.com"
                  required
                />
              </label>
              <label>
                Address
                <input
                  name="address"
                  value={checkoutForm.address}
                  onChange={handleFormChange}
                  placeholder="123 Test Street"
                  required
                />
              </label>
              <label>
                City
                <input
                  name="city"
                  value={checkoutForm.city}
                  onChange={handleFormChange}
                  placeholder="Melbourne"
                  required
                />
              </label>
              <label>
                Country
                <input
                  name="country"
                  value={checkoutForm.country}
                  onChange={handleFormChange}
                  placeholder="Australia"
                  required
                />
              </label>
            </div>

            <button type="submit" className="checkout-button" disabled={submitting}>
              {submitting ? 'Creating checkout...' : 'Pay with UduPay'}
            </button>

            {message ? <p className="status-message">{message}</p> : null}

            {checkoutResult ? (
              <div className="result-box">
                <p>
                  <strong>Checkout ID:</strong> {checkoutResult.checkoutId}
                </p>
                <p>
                  <strong>Status:</strong> {checkoutResult.status}
                </p>
                <p>
                  <strong>Redirect token:</strong> {checkoutResult.redirectToken}
                </p>
                {checkoutResult.previewUrl ? (
                  <p>
                    <strong>Preview:</strong>{' '}
                    <a href={checkoutResult.previewUrl} target="_blank" rel="noreferrer">
                      Open checkout preview
                    </a>
                  </p>
                ) : null}
                {checkoutResult.appRedirectUrl ? (
                  <p>
                    <strong>App redirect:</strong> {checkoutResult.appRedirectUrl}
                  </p>
                ) : null}
              </div>
            ) : null}
          </form>
        </aside>
      </main>
    </div>
  )
}

export default App
