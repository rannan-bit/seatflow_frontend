import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import AdminLayout from "../../components/AdminLayout.jsx";
import { money } from "../../data/initialData.js";
import { getAllOrdersAPI, updateOrderStatusAPI } from "../../services/allAPI.js";

const STATUS_FILTERS = ["All", "Pending", "Preparing", "Ready", "Served", "Cancelled"];

const STATUS_CLASS = {
  Pending: "waiting",
  Preparing: "waiting",
  Ready: "available",
  Served: "available",
  Cancelled: "occupied"
};

// The next preparation stage for each status
const NEXT_STAGE = {
  Pending: { status: "Preparing", label: "Start preparing" },
  Preparing: { status: "Ready", label: "Mark ready" },
  Ready: { status: "Served", label: "Mark served" }
};

function getErrorMessage(response, fallback) {
  const data = response?.response?.data ?? response?.data;
  if (typeof data === "string" && data.trim()) {
    return data;
  }
  return data?.message || fallback;
}

function orderNumber(order) {
  return `SF-${String(order._id).slice(-6).toUpperCase()}`;
}

function formatTime(date) {
  if (!date) {
    return "—";
  }
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function StaffOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);

  const [busyId, setBusyId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      const response = await getAllOrdersAPI();

      if (!active) {
        return;
      }

      if (response?.status === 200 && Array.isArray(response.data)) {
        setOrders(response.data);
        setError("");
      } else {
        setError(getErrorMessage(response, "We couldn't load orders. Please try again."));
      }

      setUnauthorized(response?.response?.status === 401);
      setLoading(false);
      setRefreshing(false);
    }

    loadOrders();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  function refresh() {
    setRefreshing(true);
    setActionError("");
    setRefreshKey((key) => key + 1);
  }

  async function updateOrder(order, updates) {
    setBusyId(order._id);
    setActionError("");

    const response = await updateOrderStatusAPI(order._id, updates);

    if (response?.status >= 200 && response?.status < 300) {
      refresh();
    } else {
      setActionError(getErrorMessage(response, "Failed to update the order. Please try again."));
    }

    setBusyId(null);
  }

  const searchKey = search.trim().toLowerCase();
  const visibleOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    const customerName = String(order.queue?.customerName || "").toLowerCase();
    const matchesSearch = !searchKey
      || customerName.includes(searchKey)
      || String(order._id || "").toLowerCase().includes(searchKey)
      || orderNumber(order).toLowerCase().includes(searchKey);
    return matchesStatus && matchesSearch;
  });

  const pendingCount = orders.filter((order) => order.status === "Pending").length;
  const preparingCount = orders.filter((order) => order.status === "Preparing").length;
  const readyCount = orders.filter((order) => order.status === "Ready").length;

  return (
    <AdminLayout role="Staff" title="Orders">
      <h1>Food orders</h1>
      <p className="muted-text">
        {orders.length} orders · {pendingCount} pending · {preparingCount} preparing · {readyCount} ready
      </p>

      {unauthorized && (
        <div className="info-box">
          <strong>Please sign in to manage orders.</strong>
          <p><Link className="text-link" to="/staff-login">Go to staff login →</Link></p>
        </div>
      )}

      <section className="panel">
        <div className="queue-toolbar">
          <div className="search-box queue-search">
            <Search size={15} />
            <input
              placeholder="Search by customer name or order ID…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <button className="button button-outline" onClick={refresh} disabled={refreshing || loading}>
            <RefreshCw size={14} /> {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        <div className="category-chips">
          {STATUS_FILTERS.map((item) => (
            <button
              key={item}
              className={statusFilter === item ? "selected" : ""}
              onClick={() => setStatusFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {actionError && <p className="form-error">{actionError}</p>}
        {error && !actionError && <p className="form-error">{error}</p>}

        {loading ? (
          <p className="empty-state">Loading orders…</p>
        ) : visibleOrders.length === 0 ? (
          <p className="empty-state">
            {orders.length === 0
              ? "No customer orders yet."
              : "No orders match your search or filter."}
          </p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ORDER</th>
                  <th>CUSTOMER</th>
                  <th>ITEMS</th>
                  <th>TOTAL</th>
                  <th>STATUS</th>
                  <th>PAYMENT</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {visibleOrders.map((order) => {
                  const busy = busyId === order._id;
                  const expanded = expandedId === order._id;
                  const nextStage = NEXT_STAGE[order.status];
                  const isFinal = order.status === "Served" || order.status === "Cancelled";
                  const itemCount = order.items?.reduce((total, item) => total + item.quantity, 0) || 0;

                  return (
                    <Fragment key={order._id}>
                      <tr key={order._id}>
                        <td>
                          <strong>{orderNumber(order)}</strong>
                          <small>{formatTime(order.createdAt)} · {order.queue?.token || "—"}</small>
                        </td>
                        <td>
                          <strong>{order.queue?.customerName || "Guest"}</strong>
                          <small>{order.queue?.guests ? `${order.queue.guests} guests` : "—"}</small>
                        </td>
                        <td>
                          <button
                            className="button button-outline"
                            onClick={() => setExpandedId(expanded ? null : order._id)}
                          >
                            {itemCount} {itemCount === 1 ? "item" : "items"}
                            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                        </td>
                        <td><strong>{money(order.totalAmount)}</strong></td>
                        <td>
                          <span className={`status-pill ${STATUS_CLASS[order.status] || "waiting"}`}>
                            ● {order.status}
                          </span>
                        </td>
                        <td>
                          <span className={`status-pill ${order.paymentStatus === "Paid" ? "available" : "waiting"}`}>
                            ● {order.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            {nextStage && (
                              <button
                                className="button"
                                onClick={() => updateOrder(order, { status: nextStage.status })}
                                disabled={busy}
                              >
                                {nextStage.label}
                              </button>
                            )}

                            {!isFinal && (
                              <button
                                className="button button-outline"
                                onClick={() => {
                                  if (window.confirm(`Cancel ${orderNumber(order)}?`)) {
                                    updateOrder(order, { status: "Cancelled" });
                                  }
                                }}
                                disabled={busy}
                              >
                                Cancel
                              </button>
                            )}

                            {order.paymentStatus === "Unpaid" && order.status !== "Cancelled" && (
                              <button
                                className="button button-outline"
                                onClick={() => updateOrder(order, { paymentStatus: "Paid" })}
                                disabled={busy}
                              >
                                Mark paid
                              </button>
                            )}

                            {isFinal && (order.status === "Cancelled" || order.paymentStatus === "Paid") && (
                              <span className="table-no-action">No actions</span>
                            )}
                          </div>
                        </td>
                      </tr>

                      {expanded && (
                        <tr className="order-details-row" key={`${order._id}-details`}>
                          <td colSpan={7}>
                            <div className="order-details">
                              <div>
                                <small className="order-details-label">ITEMS</small>
                                {order.items?.map((item) => (
                                  <div className="order-item-line" key={item._id}>
                                    <span>{item.quantity} × {item.food?.name || "Food item"}</span>
                                    <span>{money(item.price * item.quantity)}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="order-totals">
                                <p><span>Subtotal</span><strong>{money(order.subtotal)}</strong></p>
                                <p><span>Tax</span><strong>{money(order.tax)}</strong></p>
                                <p><span>Total</span><strong>{money(order.totalAmount)}</strong></p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
