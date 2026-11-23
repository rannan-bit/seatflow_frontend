import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Armchair,
  ClipboardList,
  RefreshCw,
  Clock3,
  UtensilsCrossed,
  ChefHat
} from "lucide-react";

import AdminLayout from "../../components/AdminLayout.jsx";
import StatsCards from "../../components/StatsCards.jsx";
import QueueTable from "../../components/QueueTable.jsx";
import { getAllQueuesAPI, getAllOrdersAPI } from "../../services/allAPI.js";
import { money } from "../../data/initialData.js";

// Time-based greeting
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Format today's date for display
function getTodayDisplay() {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short"
  }).format(new Date());
}

// Get ISO date string for APIs (Asia/Kolkata)
const getTodayDate = () => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata"
  }).format(new Date());
};

const shortcuts = [
  {
    title: "Queue management",
    description: "Review waitlist, assign tables and seat parties",
    path: "/staff/queue",
    Icon: Users
  },
  {
    title: "Table & Queue",
    description: "Real-time floor capacity and table assignments",
    path: "/staff/tables",
    Icon: Armchair
  },
  {
    title: "Food orders",
    description: "Manage incoming kitchen tickets and serving status",
    path: "/staff/orders",
    Icon: ClipboardList
  }
];

export default function StaffDashboard() {
  const [queue, setQueue] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Get logged-in staff member's name
  let staffName = "";
  try {
    const stored = sessionStorage.getItem("seatflowUser");
    if (stored) {
      const parsed = JSON.parse(stored);
      staffName = parsed?.name || "";
    }
  } catch {
    // ignore parsing errors
  }

  useEffect(() => {
    let active = true;

    async function loadLiveDashboard() {
      try {
        setError("");
        const todayDate = getTodayDate();

        const [queueResponse, ordersResponse] = await Promise.all([
          getAllQueuesAPI(null, todayDate),
          getAllOrdersAPI(null, todayDate)
        ]);

        if (!active) return;

        const queueOk =
          queueResponse?.status === 200 && Array.isArray(queueResponse.data);
        const ordersOk =
          ordersResponse?.status === 200 && Array.isArray(ordersResponse.data);

        if (queueOk) {
          setQueue(queueResponse.data);
        }

        if (ordersOk) {
          setOrders(ordersResponse.data);
        }

        if (!queueOk && !ordersOk) {
          setError("Unable to load live dashboard data. Please try refreshing.");
        }
      } catch (err) {
        if (active) {
          console.error("Staff dashboard load error:", err);
          setError("Failed to fetch live updates from server.");
        }
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    loadLiveDashboard();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  function refresh() {
    setRefreshing(true);
    setRefreshKey((key) => key + 1);
  }

  // Active waiting queue entries
  const waitingQueue = queue.filter(
    (item) => item.status === "Waiting" || item.status === "Assigned"
  );
  const waitingCount = queue.filter((item) => item.status === "Waiting").length;
  const assignedCount = queue.filter((item) => item.status === "Assigned").length;
  const seatedCount = queue.filter((item) => item.status === "Seated").length;

  // Active kitchen orders
  const activeOrders = orders.filter(
    (o) => o.status === "Pending" || o.status === "Preparing" || o.status === "Ready"
  );
  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const preparingCount = orders.filter((o) => o.status === "Preparing").length;
  const readyCount = orders.filter((o) => o.status === "Ready").length;

  return (
    <AdminLayout role="Staff" title="Dashboard">
      <div className="dashboard-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "4px" }}>
        <div>
          <h1>{getGreeting()}{staffName ? `, ${staffName}` : ""}</h1>
          <p className="muted-text">
            {getTodayDisplay()} · Real-time service status at The Olive Room.
          </p>
        </div>

        <button
          type="button"
          className="button button-outline"
          onClick={refresh}
          disabled={refreshing || loading}
          style={{ alignSelf: "center" }}
        >
          <RefreshCw size={14} className={refreshing ? "spin" : ""} />
          {refreshing ? "Refreshing…" : "Refresh live"}
        </button>
      </div>

      {error && <p className="form-error" style={{ marginBottom: 16 }}>{error}</p>}

      {/* Live Statistics Cards */}
      <StatsCards />

      {/* Quick Navigation Shortcuts */}
      <div className="shortcut-grid" style={{ marginBottom: 24 }}>
        {shortcuts.map(({ title, description, path, Icon }) => (
          <Link className="shortcut-card" to={path} key={path}>
            <Icon size={22} />
            <div>
              <strong>{title}</strong>
              <p>{description}</p>
            </div>
            <span>›</span>
          </Link>
        ))}
      </div>

      {/* Live Waiting Queue Panel */}
      <section className="panel" style={{ marginBottom: 24 }}>
        <div className="queue-toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <h2 style={{ margin: 0 }}>Live waiting queue</h2>
            <p className="muted-text" style={{ margin: "2px 0 0", fontSize: 13 }}>
              {waitingCount} waiting · {assignedCount} assigned · {seatedCount} currently seated
            </p>
          </div>
          <Link className="text-link" to="/staff/queue" style={{ fontSize: 13, fontWeight: 600 }}>
            Manage queue →
          </Link>
        </div>

        <QueueTable queue={waitingQueue} loading={loading} />

        {waitingQueue.length > 0 && (
          <div style={{ marginTop: 14, textAlign: "right" }}>
            <Link className="text-link" to="/staff/queue">
              View all {queue.length} queue records for today →
            </Link>
          </div>
        )}
      </section>

      {/* Live Kitchen & Food Orders Summary */}
      <section className="panel">
        <div className="queue-toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <ChefHat size={18} /> Live kitchen tickets
            </h2>
            <p className="muted-text" style={{ margin: "2px 0 0", fontSize: 13 }}>
              {pendingCount} pending · {preparingCount} preparing · {readyCount} ready to serve
            </p>
          </div>
          <Link className="text-link" to="/staff/orders" style={{ fontSize: 13, fontWeight: 600 }}>
            Open kitchen orders →
          </Link>
        </div>

        {loading ? (
          <p className="empty-state">Checking live kitchen tickets…</p>
        ) : activeOrders.length === 0 ? (
          <p className="empty-state">
            No active kitchen tickets. All orders have been served or completed.
          </p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ORDER / TOKEN</th>
                  <th>GUEST</th>
                  <th>ITEMS</th>
                  <th>TOTAL</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {activeOrders.slice(0, 5).map((order) => {
                  const itemCount =
                    order.items?.reduce((tot, i) => tot + i.quantity, 0) || 0;
                  const orderCode = `SF-${String(order._id).slice(-6).toUpperCase()}`;

                  return (
                    <tr key={order._id}>
                      <td>
                        <strong>{orderCode}</strong>
                        <small>{order.queue?.token || "—"}</small>
                      </td>
                      <td>
                        <strong>{order.queue?.customerName || "Guest"}</strong>
                        <small>{order.queue?.guests ? `${order.queue.guests} guests` : ""}</small>
                      </td>
                      <td>{itemCount} {itemCount === 1 ? "item" : "items"}</td>
                      <td><strong>{money(order.totalAmount)}</strong></td>
                      <td>
                        <span
                          className={`status-pill ${
                            order.status === "Ready"
                              ? "available"
                              : order.status === "Preparing"
                              ? "waiting"
                              : "reserved"
                          }`}
                        >
                          ● {order.status}
                        </span>
                      </td>
                      <td>
                        <Link
                          className="button button-outline"
                          to="/staff/orders"
                          style={{ padding: "4px 10px", fontSize: 12, minHeight: 28 }}
                        >
                          View order
                        </Link>
                      </td>
                    </tr>
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
