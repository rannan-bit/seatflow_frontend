import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, CircleAlert, ClipboardList, Utensils } from "lucide-react";
import CustomerLayout from "../../components/CustomerLayout.jsx";
import { money } from "../../data/initialData.js";
import { getCustomerOrdersAPI } from "../../services/allAPI.js";

const REFRESH_INTERVAL = 10000

const steps = [
  ["✓", "Order confirmed", "We received your order"],
  ["2", "Preparing your food", "The kitchen is preparing your order"],
  ["3", "Ready to serve", "Your food is ready"],
  ["4", "Served at your table", "Enjoy your meal!"]
];

// Orders are placed only after seating, so the timeline starts at the kitchen.
// `completed` = steps already finished, `current` = step currently in progress (-1 = none).
const STATUS_TIMELINE = {
  Pending: { completed: 1, current: -1 },
  Preparing: { completed: 1, current: 1 },
  Ready: { completed: 2, current: 2 },
  Served: { completed: 4, current: -1 },
  Cancelled: { completed: 0, current: -1 }
}

const STATUS_STYLES = {
  Pending: { className: "waiting", label: "ORDER CONFIRMED" },
  Preparing: { className: "waiting", label: "PREPARING" },
  Ready: { className: "available", label: "READY TO SERVE" },
  Served: { className: "available", label: "SERVED" },
  Cancelled: { className: "occupied", label: "CANCELLED" }
}

const isTerminal = (status) => status === "Served" || status === "Cancelled"

function readStoredJSON(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null")
  } catch {
    return null
  }
}

function formatTime(date) {
  if (!date) {
    return ""
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default function OrderTracking() {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatedAt, setUpdatedAt] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const storedOrder = readStoredJSON("seatflowOrder")
    const storedCustomer = readStoredJSON("seatflowCustomer")

    const token = storedOrder?.token || storedCustomer?.token
    const orderId = storedOrder?.id || storedOrder?._id

    if (!token) {
      setOrder(null)
      setError("We couldn't find your order. Please place an order first.")
      setLoading(false)
      return
    }

    let active = true
    let intervalId = null

    async function loadOrder() {
      const response = await getCustomerOrdersAPI(token)
      if (!active) {
        return
      }

      const orders = response?.data?.orders

      if (response?.status === 200 && Array.isArray(orders)) {
        // Prefer the order saved on this device, otherwise use the latest one
        const latestOrder = orders.find((item) => item._id === orderId) || orders[0] || null

        setOrder(latestOrder)
        setError(latestOrder ? "" : "We couldn't find any order for your token yet.")
        setUpdatedAt(new Date())

        // Stop polling once the order reaches a final state
        if (!latestOrder || isTerminal(latestOrder.status)) {
          clearInterval(intervalId)
        }
      }
      else if (response?.response?.status === 404) {
        clearInterval(intervalId)
        setError("We couldn't find your check-in. Please check in and order again.")
      }
      else {
        // Keep the last known order on screen and keep retrying
        setError("We couldn't refresh your order. Retrying every 10 seconds.")
      }

      setLoading(false)
    }

    setLoading(true)
    loadOrder()

    // Refresh the order status automatically
    intervalId = setInterval(loadOrder, REFRESH_INTERVAL)

    return () => {
      active = false
      clearInterval(intervalId)
    }
  }, [reloadKey])

  // Nothing to show yet (no token, no order, or an unrecoverable API error)
  if (loading) {
    return (
      <CustomerLayout active="Order">
        <section className="token-card empty-queue-card">
          <span className="status-pill waiting">● LOADING</span>
          <h1>Fetching your order…</h1>
          <p className="muted-text">This only takes a moment.</p>
        </section>
      </CustomerLayout>
    )
  }

  if (!order) {
    return (
      <CustomerLayout active="Order">
        <section className="token-card empty-queue-card">
          <span className="status-pill">● NO ORDER</span>
          <div className="empty-queue-icon"><ClipboardList size={26} /></div>
          <h1>No order found</h1>
          <p className="muted-text">{error || "Looks like you haven't placed an order yet."}</p>
          <button className="button full-width" onClick={() => setReloadKey((key) => key + 1)}>
            Try again
          </button>
          <Link className="button button-outline full-width" to="/customer/menu" style={{ marginTop: 8 }}>
            Browse the menu →
          </Link>
        </section>
      </CustomerLayout>
    )
  }

  const status = order.status
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.Pending
  const timeline = STATUS_TIMELINE[status] || STATUS_TIMELINE.Pending
  const paymentLabel = order.paymentStatus === "Paid" ? "Paid" : "Pay after dining"
  const itemCount = order.items?.reduce((total, item) => total + item.quantity, 0) || 0
  const queue = order.queue
  const customerName = queue?.customerName || "there"
  const orderNumber = `SF-${String(order._id).slice(-6).toUpperCase()}`
  const cancelled = status === "Cancelled"

  return (
    <CustomerLayout active="Order">
      <div className="success-icon">
        {cancelled ? <CircleAlert size={25} /> : <Check size={25} />}
      </div>
      <h1 className="centered">Good choice, {customerName}.</h1>
      <p className="muted-text centered">
        {cancelled
          ? "This order has been cancelled. Please ask the host if you need help."
          : "Your order is confirmed. Sit back and relax."}
      </p>

      <section className="order-number">
        <div><small>YOUR ORDER</small><strong>{orderNumber}</strong></div>
        <span className={`status-pill ${statusStyle.className}`}>{statusStyle.label}</span>
      </section>

      <div className="order-timeline">
        {steps.map(([number, title, description], index) => {
          const stepClass = index < timeline.completed
            ? "completed"
            : index === timeline.current
              ? "current"
              : ""

          return (
            <div className="timeline-step" key={title}>
              <span className={stepClass}>{number}</span>
              <div><strong>{title}</strong><p>{description}</p></div>
            </div>
          )
        })}
      </div>

      <div className="info-box">
        <strong>{queue?.token || "Your token"} · Party of {queue?.guests || "—"} · {queue?.status || "Waiting"}</strong>
        <p>{cancelled ? "No payment due for a cancelled order" : `${paymentLabel} · ${order.paymentStatus}`}</p>
      </div>

      <div className="section-heading">
        <strong>Your items</strong>
        <small>{itemCount} {itemCount === 1 ? "item" : "items"}</small>
      </div>

      {order.items?.map((item) => (
        <article className="cart-item" key={item._id}>
          <span className="food-emoji food-placeholder"><Utensils size={20} /></span>
          <div className="food-details">
            <strong>{item.food?.name || "Food item"}</strong>
            <p>Qty {item.quantity} · {money(item.price)} each</p>
          </div>
          <strong>{money(item.price * item.quantity)}</strong>
        </article>
      ))}

      <div className="bill-summary">
        <p><span>Item subtotal</span><strong>{money(order.subtotal)}</strong></p>
        <p><span>GST (5%)</span><strong>{money(order.tax)}</strong></p>
        <hr />
        <p><strong>Total</strong><strong>{money(order.totalAmount)}</strong></p>
      </div>

      {error && <p className="form-error">{error}</p>}
      <p className="queue-refresh">
        {updatedAt ? `Updated at ${formatTime(updatedAt)}` : "Updating…"}
        {isTerminal(status) ? "" : " · refreshes every 10 seconds"}
      </p>
    </CustomerLayout>
  );
}
