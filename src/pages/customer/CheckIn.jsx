import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserRound, Phone, Minus, Plus, ArrowRight } from "lucide-react";
import Brand from "../../components/Brand.jsx";
import { checkInCustomerAPI } from "../../services/allAPI.js";

export default function CheckIn() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [guests, setGuests] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const navigate = useNavigate()

  //increase guests number
  function increaseGuests() {
    setGuests((guest) => Math.min(guest + 1, 20));
  }

  //decrease the guests number
  function decreaseGuests() {
    setGuests((guest) => Math.max(1, guest - 1))
  }

  //handle submission form
  async function joinQueue() {
    if (submitting) {
      return
    }

    setError("")

    //validate name
    const customerName = name.trim()
    if (customerName === "") {
      setError("Please enter your name")
      return
    }
    //validate phone
    const customerPhone = phone.trim()
    if (!/^\d{10}$/.test(customerPhone)) {
      setError("Please enter a valid 10-digit phonenumber")
      return
    }
    if (guests < 1) {
      setError("Please select at least 1 guest")
      return
    }

    setSubmitting(true)

    try {
      //backend validates, generates the token and saves the customer
      const response = await checkInCustomerAPI({
        customerName: customerName,
        phone: customerPhone,
        guests: guests
      })

      const queue = response?.data?.queue
      const isSuccess = response?.status >= 200 && response?.status < 300 && queue

      if (!isSuccess) {
        setError(response?.data?.message || "Could not join the queue. Please try again.")
        return
      }

      //store the backend response in local storage
      const customer = {
        id: queue._id,
        name: queue.customerName,
        phone: queue.phone,
        guests: queue.guests,
        token: queue.token,
        status: queue.status,
        joinedAt: queue.joinedAt
      }

      localStorage.setItem(
        "seatflowCustomer",
        JSON.stringify(customer)
      )

      //navigate to Queue status page
      navigate('/customer/queue')
    }
    catch (err) {
      setError(err?.response?.data?.message || "Could not join the queue. Please try again.")
    }
    finally {
      setSubmitting(false)
    }
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
        <div className="input-with-icon"><UserRound size={15} /><input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <label>Phone number</label>
        <div className="input-with-icon"><Phone size={15} /><input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        <label>Number of guests</label>
        <div className="guest-counter">
          <button onClick={decreaseGuests}><Minus size={15} /></button>
          <strong>{guests} {guests === 1 ? "guest" : "guests"}</strong>
          <button onClick={increaseGuests}><Plus size={15} /></button>
        </div>
        {
          error &&
          <p className="form-error">{error}</p>
        }
        <button onClick={joinQueue} className="button full-width" disabled={submitting}>
          {submitting ? "Joining the queue..." : "Join the queue"} {!submitting && <ArrowRight size={16} />}
        </button>
        <small className="helper-text">We’ll only use your number for queue and order updates.</small>
      </section>
    </div>
  );
}
