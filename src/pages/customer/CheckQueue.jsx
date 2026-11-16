import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Ticket, ArrowRight } from "lucide-react";
import Brand from "../../components/Brand.jsx";
import { getCustomerQueueStatusAPI } from "../../services/allAPI.js";

export default function CheckQueue() {
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleCheckQueue(e) {
    e.preventDefault();

    if (submitting) return;

    setError("");

    const trimmedToken = token.trim().toUpperCase();

    if (!trimmedToken) {
      setError("Please enter your queue token.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await getCustomerQueueStatusAPI(trimmedToken);

      const isSuccess =
        response?.status >= 200 &&
        response?.status < 300 &&
        response?.data?.queue;

      if (!isSuccess) {
        setError(
          response?.data?.message ||
            "We couldn't find a queue entry for that token."
        );
        return;
      }

      const latestQueue = response.data.queue;

      // Persist to localStorage so QueueStatus can auto-restore it
      const customerData = {
        id: latestQueue._id,
        name: latestQueue.customerName,
        phone: latestQueue.phone,
        guests: latestQueue.guests,
        token: latestQueue.token,
        status: latestQueue.status,
        joinedAt: latestQueue.joinedAt,
      };

      localStorage.setItem("seatflowCustomer", JSON.stringify(customerData));

      navigate("/customer/queue");
    } catch (err) {
      if (err?.response?.status === 404) {
        setError(
          "No queue entry found for that token. Please check the token and try again."
        );
      } else {
        setError(
          err?.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="checkin-page">
      <section className="checkin-hero">
        <Brand />
        <span>THE OLIVE ROOM</span>
        <h1>
          Welcome back.<br />
          <em>Find your place.</em>
        </h1>
        <p>Enter your queue token to pick up where you left off.</p>
      </section>

      <section className="checkin-card">
        <h2>Retrieve your queue</h2>
        <p>
          Your token was shown after check-in. It looks like{" "}
          <strong>SF-123456</strong>.
        </p>

        <form onSubmit={handleCheckQueue}>
          <label>Queue token</label>
          <div className="input-with-icon">
            <Ticket size={15} />
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="e.g. SF-123456"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="button full-width"
            disabled={submitting}
          >
            {submitting ? "Checking your token…" : "Find my queue"}{" "}
            {!submitting && <ArrowRight size={16} />}
          </button>
        </form>

        <small className="helper-text">
          Don't have a token?{" "}
          <Link to="/customer/check-in">Join the queue here.</Link>
        </small>
      </section>
    </div>
  );
}
