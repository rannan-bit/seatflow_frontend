import CustomerLayout from "../../components/CustomerLayout.jsx";
import { Link } from "react-router-dom";

export default function QueueStatus() {
  const customer = JSON.parse(localStorage.getItem("seatflowCustomer") || '{"name":"Aarav Shah","guests":4}');
  const firstName = customer.name.split(" ")[0];

  return (
    <CustomerLayout active="Queue">
      <h1>You’re on the list, {firstName}.</h1>
      <p className="muted-text">Settle in. We’ll let you know when it’s your turn.</p>
      <section className="token-card">
        <span className="status-pill available">● YOU’RE IN THE QUEUE</span>
        <small>YOUR TOKEN</small>
        <strong>A-024</strong>
        <b>{customer.name} · {customer.guests} guests</b>
        <hr />
        <div className="queue-stats">
          <div><strong>3</strong><small>Parties ahead</small></div>
          <div><strong>15–20 min</strong><small>Estimated wait</small></div>
        </div>
      </section>
      <div className="info-box"><strong>A fair queue, a table that fits.</strong><p>We seat in arrival order, matched to party size and available tables. Waits may vary.</p></div>
      <Link className="button full-width" to="/customer/menu">Browse the menu while you wait →</Link>
      <p className="helper-text centered">Stay nearby. Your place in queue is safe.</p>
    </CustomerLayout>
  );
}