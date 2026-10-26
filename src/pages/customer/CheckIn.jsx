import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserRound, Phone, Minus, Plus, ArrowRight } from "lucide-react";
import Brand from "../../components/Brand.jsx";

export default function CheckIn() {
  const [name, setName] = useState("Aarav Shah");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [guests, setGuests] = useState(4);
  const navigate = useNavigate();

  function joinQueue() {
    localStorage.setItem("seatflowCustomer", JSON.stringify({ name, phone, guests }));
    navigate("/customer/queue");
  }

  return (
    <div className="checkin-page">
      <section className="checkin-hero">
        <Brand />
        <span>THE OLIVE ROOM</span>
        <h1>Good food.<br />Worth the wait.</h1>
        <p>Your table starts here. We'll take it from here.</p>
      </section>
      <section className="checkin-card">
        <h2>Let’s get you a table</h2>
        <p>Join the queue, then explore something delicious.</p>
        <label>Your name</label>
        <div className="input-with-icon"><UserRound size={15} /><input value={name} onChange={(event) => setName(event.target.value)} /></div>
        <label>Phone number</label>
        <div className="input-with-icon"><Phone size={15} /><input value={phone} onChange={(event) => setPhone(event.target.value)} /></div>
        <label>Number of guests</label>
        <div className="guest-counter">
          <button onClick={() => setGuests(Math.max(1, guests - 1))}><Minus size={15} /></button>
          <strong>{guests} guests</strong>
          <button onClick={() => setGuests(Math.min(12, guests + 1))}><Plus size={15} /></button>
        </div>
        <button className="button full-width" onClick={joinQueue}>Join the queue <ArrowRight size={16} /></button>
        <small className="helper-text">We’ll only use your number for queue and order updates.</small>
      </section>
    </div>
  );
}