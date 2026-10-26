import CustomerLayout from "../../components/CustomerLayout.jsx";
import { money } from "../../data/initialData.js";

const steps = [
  ["✓", "Order confirmed", "We received your order · 12:42 PM"],
  ["2", "Waiting for your table", "Your order is held; no cooking yet"],
  ["3", "Freshly prepared", "Kitchen starts once you’re seated"],
  ["4", "Served at your table", "All yours! Enjoy your food"]
];

export default function OrderTracking() {
  const order = JSON.parse(localStorage.getItem("seatflowOrder") || "null");
  return (
    <CustomerLayout active="Order">
      <div className="success-icon">✓</div>
      <h1 className="centered">Good choice, Aarav.</h1>
      <p className="muted-text centered">Your order is confirmed. Your queue spot is safe.</p>
      <section className="order-number"><div><small>YOUR ORDER</small><strong>SF-1082</strong></div><span className="status-pill waiting">Waiting seating</span></section>
      <div className="order-timeline">
        {steps.map(([number, title, description], index) => (
          <div className="timeline-step" key={title}>
            <span className={index === 0 ? "completed" : index === 1 ? "current" : ""}>{number}</span>
            <div><strong>{title}</strong><p>{description}</p></div>
          </div>
        ))}
      </div>
      <div className="info-box"><strong>A-024 · Party of 4 · Waiting</strong><p>3 parties ahead · About 10–15 min</p></div>
      <div className="bill-summary"><p><strong>{order?.items?.length || 3} items · {money(order?.total || 941.85)}</strong><span>Pay after dining</span></p></div>
      <p className="centered helper-text">Need to change something? Ask the host.</p>
    </CustomerLayout>
  );
}