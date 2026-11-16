import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ListOrdered } from "lucide-react";
import Brand from "../components/Brand.jsx";

export default function Home() {
  const [hasActiveQueue, setHasActiveQueue] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("seatflowCustomer");
      if (stored) {
        const customer = JSON.parse(stored);
        const activeStatuses = ["Waiting", "Assigned", "Seated"];
        if (customer?.token && activeStatuses.includes(customer?.status)) {
          setHasActiveQueue(true);
        }
      }
    } catch {
      // ignore malformed data
    }
  }, []);

  return (
    <main className="landing-page">
      <Brand />
      <p className="eyebrow">SMART RESTAURANT SEATING</p>
      <h1>
        Less waiting.<br />
        <em>More enjoying.</em>
      </h1>
      <p className="landing-description">
        Join the queue, discover your favourites, and enjoy your meal at The
        Olive Room.
      </p>

      <div className="landing-actions">
        {hasActiveQueue ? (
          <>
            <Link className="button" to="/customer/queue">
              Check queue status <ArrowRight size={16} />
            </Link>
            <Link className="button button-outline" to="/customer/check-in">
              New check-in
            </Link>
          </>
        ) : (
          <Link className="button" to="/customer/check-in">
            Join the queue <ArrowRight size={16} />
          </Link>
        )}
        <Link className="button button-outline" to="/staff-login">
          Staff portal
        </Link>
        <Link className="button button-outline" to="/admin-login">
          Admin portal
        </Link>
      </div>

      <div className="sample-token">
        <span className="status-pill available">● LIVE QUEUE</span>
        {hasActiveQueue ? (
          <>
            <small>YOUR QUEUE</small>
            <strong>Active</strong>
            <p>
              <Link to="/customer/queue">View your queue status</Link>
            </p>
          </>
        ) : (
          <>
            <small>HAVE A TOKEN?</small>
            <strong>
              <Link to="/customer/check-queue">
                <ListOrdered size={14} /> Check queue status
              </Link>
            </strong>
            <p>Enter your token to find your place in the queue</p>
          </>
        )}
      </div>
    </main>
  );
}
