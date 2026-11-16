import { useEffect, useState } from "react";
import { Armchair, Bell, Ticket } from "lucide-react";
import CustomerLayout from "../../components/CustomerLayout.jsx";
import { Link, useNavigate } from "react-router-dom";
import { getCustomerQueueStatusAPI } from "../../services/allAPI.js";
import { subscribeCustomerToPush } from "../../services/pushService.js";

const REFRESH_INTERVAL = 10000;

// Visual treatment + label for every queue status
const STATUS_STYLES = {
  Waiting: { className: "waiting", label: "WAITING" },
  Assigned: { className: "reserved", label: "TABLE ASSIGNED" },
  Seated: { className: "occupied", label: "SEATED" },
  Completed: { className: "available", label: "COMPLETED" },
  Cancelled: { className: "occupied", label: "CANCELLED" }
};

function getStatusStyle(status) {
  return STATUS_STYLES[status] || STATUS_STYLES.Waiting;
}

function formatTime(date) {
  if (!date) return "";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function QueueStatus() {

  const navigate = useNavigate();

  // Customer notification states
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushError, setPushError] = useState("");

  // Queue states
  const [customer, setCustomer] = useState(null);
  const [queue, setQueue] = useState(null);
  const [waitingAhead, setWaitingAhead] = useState(0);
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  // Enable browser push notifications
  async function handleEnableNotifications() {
    try {
      setPushLoading(true);
      setPushError("");

      if (!customer?.token) {
        throw new Error("Customer queue token not found.");
      }

      if (!("Notification" in window)) {
        throw new Error("Your browser does not support notifications.");
      }

      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("Your browser does not support push notifications.");
      }

      if (!window.isSecureContext) {
        throw new Error("Notifications require HTTPS or localhost.");
      }

      if (Notification.permission === "denied") {
        throw new Error(
          "Notifications are blocked. Please enable them in your browser settings."
        );
      }

      await subscribeCustomerToPush(customer.token);

      setPushEnabled(true);

    } catch (err) {
      console.error("Notification error:", err);

      setPushError(
        err.response?.data?.message ||
        err.message ||
        "Unable to enable notifications."
      );

    } finally {
      setPushLoading(false);
    }
  }

  // Retrieve existing browser subscription
  useEffect(() => {
    let active = true;

    async function checkExistingSubscription() {
      try {
        if (
          !("Notification" in window) ||
          !("serviceWorker" in navigator) ||
          !("PushManager" in window)
        ) {
          return;
        }

        if (Notification.permission !== "granted") {
          return;
        }

        const registration = await navigator.serviceWorker.getRegistration(
          "/"
        );

        if (!registration) return;

        const subscription = await registration.pushManager.getSubscription();

        if (active && subscription) {
          setPushEnabled(true);
        }

      } catch (err) {
        console.error("Unable to check push subscription:", err);
      }
    }

    checkExistingSubscription();

    return () => {
      active = false;
    };
  }, []);

  // Load customer queue information
  useEffect(() => {

    // Retrieve customer token from local storage
    const storedCustomer = localStorage.getItem("seatflowCustomer");

    if (!storedCustomer) {
      setLoading(false);
      return;
    }

    let customerData = null;

    try {
      customerData = JSON.parse(storedCustomer);
    } catch {
      localStorage.removeItem("seatflowCustomer");
      setLoading(false);
      return;
    }

    setCustomer(customerData);

    const token = customerData?.token;

    if (!token) {
      setLoading(false);
      return;
    }

    let active = true;
    let intervalId = null;

    // Fetch latest queue status
    async function loadQueueStatus() {
      try {
        const response = await getCustomerQueueStatusAPI(token);

        if (!active) return;

        const latestQueue = response?.data?.queue;

        if (response?.status === 200 && latestQueue) {

          setQueue(latestQueue);

          setWaitingAhead(response.data.waitingAhead ?? 0);
          setPosition(response.data.position ?? null);

          setNotFound(false);
          setError("");
          setUpdatedAt(new Date());

          // Keep local storage synchronized with backend
          const updatedCustomer = {
            id: latestQueue._id,
            name: latestQueue.customerName,
            phone: latestQueue.phone,
            guests: latestQueue.guests,
            token: latestQueue.token,
            status: latestQueue.status,
            joinedAt: latestQueue.joinedAt
          };

          setCustomer(updatedCustomer);

          localStorage.setItem(
            "seatflowCustomer",
            JSON.stringify(updatedCustomer)
          );

          // Clear localStorage and redirect once the visit is finished.
          // A 2-second delay lets the customer see the final status before
          // being taken to the landing page.
          if (
            latestQueue.status === "Completed" ||
            latestQueue.status === "Cancelled"
          ) {
            clearInterval(intervalId);
            localStorage.removeItem("seatflowCustomer");
            setTimeout(() => {
              if (active) navigate("/");
            }, 2000);
          }
        }

      } catch (err) {

        if (!active) return;

        if (err.response?.status === 404) {

          clearInterval(intervalId);

          setNotFound(true);
          setError("");

          localStorage.removeItem("seatflowCustomer");

        } else {

          setError(
            "We couldn't refresh your queue status. Retrying every 10 seconds."
          );

        }

      } finally {

        if (active) {
          setLoading(false);
        }

      }
    }

    // Initial queue request
    loadQueueStatus();

    // Refresh every 10 seconds
    intervalId = setInterval(loadQueueStatus, REFRESH_INTERVAL);

    return () => {
      active = false;
      clearInterval(intervalId);
    };

  }, []);

  // No token saved or token no longer exists
  if (!customer?.token || notFound) {
    return (
      <CustomerLayout active="Queue">

        <section className="token-card empty-queue-card">

          <span className="status-pill">
            ● NOT IN QUEUE
          </span>

          <div className="empty-queue-icon">
            <Armchair size={26} />
          </div>

          <h1>
            {notFound
              ? "Your queue entry was not found"
              : "No queue information found"}
          </h1>

          <p className="muted-text">
            {notFound
              ? "We couldn't find this token in the queue anymore. Please check in again to get a new place."
              : "Looks like you haven't joined the queue yet. Join the queue to reserve your place and start exploring our menu."}
          </p>

          <Link
            className="button full-width"
            to="/customer/check-in"
          >
            Join the queue <span style={{ marginLeft: 4 }}>→</span>
          </Link>

          <Link
            className="button button-outline full-width"
            to="/customer/check-queue"
            style={{ marginTop: 10 }}
          >
            <Ticket size={15} /> Have a token? Check queue status
          </Link>

          <small className="helper-text">
            Your table starts with a quick check-in.
          </small>

        </section>

      </CustomerLayout>
    );
  }

  // Loading screen
  if (loading && !queue) {
    return (
      <CustomerLayout active="Queue">

        <section className="token-card empty-queue-card">

          <span className="status-pill waiting">
            ● LOADING
          </span>

          <h1>Fetching your queue status…</h1>

          <p className="muted-text">
            This only takes a moment.
          </p>

        </section>

      </CustomerLayout>
    );
  }

  const customerName = queue?.customerName || customer.name;
  const guests = queue?.guests ?? customer.guests;
  const token = queue?.token || customer.token;

  const status = queue?.status || customer.status || "Waiting";
  const statusStyle = getStatusStyle(status);

  const assignedTable = queue?.assignedTable;

  const isFinished =
    status === "Completed" || status === "Cancelled";

  return (
    <CustomerLayout active="Queue">

      <h1>You’re on the list, {customerName}.</h1>

      <p className="muted-text">
        Settle in. We’ll let you know when it’s your turn.
      </p>

      {/* Queue information */}
      <section className="token-card">

        <span className={`status-pill ${statusStyle.className}`}>
          ● {statusStyle.label}
        </span>

        <small>YOUR TOKEN</small>

        <strong>{token}</strong>

        <b>
          {customerName} · {guests} {guests === 1 ? "guest" : "guests"}
        </b>

        <hr />

        {/* Queue statistics */}
        <div className="queue-stats">

          <div>
            <strong>
              {status === "Waiting" ? waitingAhead : "—"}
            </strong>

            <small>Parties ahead</small>
          </div>

          <div>
            <strong>
              {status === "Waiting" && position ? `#${position}` : "—"}
            </strong>

            <small>Your position</small>
          </div>

        </div>

        {/* Assigned table information */}
        {assignedTable ? (

          <div className="assigned-table">

            <small>YOUR TABLE</small>

            <strong>
              Table {assignedTable.tableNumber}
            </strong>

            <span>
              Seats {assignedTable.capacity}
            </span>

          </div>

        ) : (

          <div className="assigned-table muted">

            <small>YOUR TABLE</small>

            <strong>Not assigned yet</strong>

            <span>
              We’ll assign one when it’s your turn
            </span>

          </div>

        )}

        {error && (
          <p className="form-error queue-refresh">
            {error}
          </p>
        )}

        <p className="queue-refresh">
          {updatedAt
            ? `Updated at ${formatTime(updatedAt)}`
            : "Updating…"}
          {" "}· refreshes every 10 seconds
        </p>

      </section>

      {/* Queue information */}
      <div className="info-box">

        <strong>A fair queue, a table that fits.</strong>

        <p>
          We seat in arrival order, matched to party size and available tables.
          Waits may vary.
        </p>

      </div>

      {/* Web Push notification section */}
      {!isFinished && (
        <div className="info-box notification-box">

          <strong className="notification-heading"><Bell size={17} /> Get table assignment notifications</strong>

          <p>
            Enable notifications so we can let you know when your table is
            ready, even when you're viewing another page.
          </p>

          {pushEnabled ? (

            <p className="success-message">
              Notifications enabled successfully.
            </p>

          ) : (

            <button
              type="button"
              className="button full-width"
              onClick={handleEnableNotifications}
              disabled={pushLoading}
            >
              {pushLoading
                ? "Enabling notifications..."
                : "Enable Notifications"}
            </button>

          )}

          {pushError && (
            <p className="form-error">
              {pushError}
            </p>
          )}

        </div>
      )}

      {/* Navigation */}
      {isFinished ? (

        <Link
          className="button full-width"
          to="/customer/check-in"
        >
          Start a new check-in →
        </Link>

      ) : (

        <Link
          className="button full-width"
          to="/customer/menu"
        >
          Browse the menu while you wait →
        </Link>

      )}

      <p className="helper-text centered">
        Stay nearby. Your place in queue is safe.
      </p>

    </CustomerLayout>
  );
}