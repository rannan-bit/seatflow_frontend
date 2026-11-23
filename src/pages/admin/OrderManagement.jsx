import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout.jsx";
import { ChevronDown, ChevronUp, RefreshCw, Search } from "lucide-react";
import {
  getAllOrdersAPI,
  updateOrderStatusAPI
} from "../../services/allAPI.js";

const STATUS_OPTIONS = {
  Pending:   ["Preparing", "Cancelled"],
  Preparing: ["Ready", "Cancelled"],
  Ready:     ["Served", "Cancelled"],
  Served:    [],
  Cancelled: []
};

const STATUS_CLASS = {
  Pending:   "waiting",
  Preparing: "waiting",
  Ready:     "available",
  Served:    "available",
  Cancelled: "occupied"
};

const PAYMENT_CLASS = {
  Paid:   "available",
  Unpaid: "waiting"
};

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState("");

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");
      const response = await getAllOrdersAPI();
      if (!Array.isArray(response.data)) {
        throw new Error("Invalid order data received from server.");
      }
      setOrders(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load orders."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadOrders(); }, []);

  async function changeStatus(orderId, newStatus) {
    try {
      setUpdatingId(orderId);
      setError("");
      setSuccess("");
      await updateOrderStatusAPI(orderId, { status: newStatus });
      setSuccess(`Order status updated to ${newStatus}.`);
      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function changePaymentStatus(orderId, newStatus) {
    try {
      setUpdatingId(orderId);
      setError("");
      setSuccess("");
      await updateOrderStatusAPI(orderId, { paymentStatus: newStatus });
      setSuccess(`Payment status updated to ${newStatus}.`);
      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update payment status.");
    } finally {
      setUpdatingId(null);
    }
  }

  const searchKey = search.trim().toLowerCase();
  const visibleOrders = orders.filter(order => {
    if (!searchKey) return true;
    const name = String(order.queue?.customerName || "").toLowerCase();
    const id = String(order._id || "").toLowerCase();
    return name.includes(searchKey) || id.includes(searchKey);
  });

  return (
    <AdminLayout role="Admin" title="Order management">
      <h1>Order management</h1>
      <p className="muted-text">View customer orders and update their current status.</p>

      {error && <p className="form-error" style={{ marginBottom: 14 }}>{error}</p>}
      {success && <p className="form-success" style={{ marginBottom: 14 }}>{success}</p>}

      <section className="panel">
        <div className="queue-toolbar">
          <div className="search-box queue-search">
            <Search size={15} />
            <input
              placeholder="Search by customer name or order ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button
            className="button button-outline"
            onClick={loadOrders}
            disabled={loading}
          >
            <RefreshCw size={14} /> {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>ORDER</th>
                <th>CUSTOMER</th>
                <th>ITEMS</th>
                <th>TOTAL</th>
                <th>ORDER STATUS</th>
                <th>PAYMENT</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: "center", padding: "32px" }}>Loading orders…</td></tr>
              ) : visibleOrders.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: "center", padding: "32px", color: "var(--color-subtle)" }}>
                  {orders.length === 0 ? "No orders found." : "No orders match your search."}
                </td></tr>
              ) : (
                visibleOrders.map((order) => {
                  const customer = order.queue;
                  const allowedStatuses = STATUS_OPTIONS[order.status] || [];
                  const expanded = expandedId === order._id;
                  const itemCount = order.items?.reduce((t, i) => t + i.quantity, 0) || 0;

                  return (
                    <>
                      <tr key={order._id}>
                        <td>
                          <strong style={{ fontFamily: "monospace", letterSpacing: "0.5px" }}>
                            SF-{order._id.slice(-6).toUpperCase()}
                          </strong>
                        </td>
                        <td>
                          <strong>{customer?.customerName || "Unknown"}</strong>
                          <small>{customer?.phone || "N/A"}</small>
                          <small>Token: {customer?.token || "N/A"}</small>
                        </td>
                        <td>
                          <button
                            className="button button-outline"
                            style={{ minHeight: 30, padding: "4px 10px", fontSize: 12 }}
                            onClick={() => setExpandedId(expanded ? null : order._id)}
                          >
                            {itemCount} {itemCount === 1 ? "item" : "items"} {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                        </td>
                        <td><strong>₹{Number(order.totalAmount).toFixed(2)}</strong></td>
                        <td>
                          <select
                            value={order.status}
                            disabled={updatingId === order._id}
                            onChange={(e) => changeStatus(order._id, e.target.value)}
                            style={{ minWidth: 0, minHeight: 32, padding: "5px 8px", fontSize: 12 }}
                          >
                            <option value={order.status}>{order.status}</option>
                            {allowedStatuses.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            value={order.paymentStatus}
                            disabled={updatingId === order._id}
                            onChange={(e) => changePaymentStatus(order._id, e.target.value)}
                            style={{ minWidth: 0, minHeight: 32, padding: "5px 8px", fontSize: 12 }}
                          >
                            <option value="Unpaid">Unpaid</option>
                            <option value="Paid">Paid</option>
                          </select>
                        </td>
                      </tr>
                      {expanded && (
                        <tr key={`${order._id}-details`} className="order-details-row">
                          <td colSpan="6">
                            <div className="order-details">
                              <div>
                                <small className="order-details-label">ITEMS</small>
                                {order.items?.map((item, i) => (
                                  <div className="order-item-line" key={i}>
                                    <span>{item.quantity} × {item.food?.name || "Deleted item"}</span>
                                    <span>₹{Number(item.price * item.quantity).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="order-totals">
                                <small className="order-details-label">TOTAL</small>
                                <p><span>Subtotal</span><strong>₹{Number(order.subtotal).toFixed(2)}</strong></p>
                                <p><span>Tax</span><strong>₹{Number(order.tax).toFixed(2)}</strong></p>
                                <p><span style={{ fontWeight: 650 }}>Total</span><strong>₹{Number(order.totalAmount).toFixed(2)}</strong></p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}
