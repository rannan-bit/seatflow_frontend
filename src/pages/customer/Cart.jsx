import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Minus, Utensils } from "lucide-react";
import CustomerLayout from "../../components/CustomerLayout.jsx";
import { money } from "../../data/initialData.js";
import { createOrderAPI } from "../../services/allAPI.js";

export default function Cart({ foods, cart, setCart }) {
  const navigate = useNavigate();

  // Customer check-in details (queue token identifies the customer on the backend)
  const [customer, setCustomer] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedCustomer = localStorage.getItem("seatflowCustomer");
    if (storedCustomer) {
      setCustomer(JSON.parse(storedCustomer));
    }
  }, []);

  const selectedFoods = foods.filter((food) => cart[food.id] > 0);
  const subtotal = selectedFoods.reduce((sum, food) => sum + food.price * cart[food.id], 0);
  // Preview only — the backend recalculates subtotal, tax and total when the order is saved
  const tax = subtotal * 0.05;

  function changeQuantity(id, amount) {
    setCart((current) => ({ ...current, [id]: Math.max(0, (current[id] || 0) + amount) }));
  }

  async function placeOrder() {
    if (placing) {
      return;
    }

    setError("");

    if (selectedFoods.length === 0) {
      setError("Your cart is empty. Add something delicious first.");
      return;
    }

    const token = customer?.token;
    if (!token) {
      setError("We couldn't find your queue token. Please check in again.");
      return;
    }

    const unavailableFood = selectedFoods.find((food) => food.available === false);
    if (unavailableFood) {
      setError(`${unavailableFood.name} is no longer available. Please remove it from your cart.`);
      return;
    }

    setPlacing(true);

    try {
      // Send only food ids and quantities — the backend owns pricing and totals
      const response = await createOrderAPI({
        token,
        items: selectedFoods.map((food) => ({
          food: food.id,
          quantity: cart[food.id]
        }))
      });

      const order = response?.data?.order;
      const isSuccess = response?.status >= 200 && response?.status < 300 && order;

      if (!isSuccess) {
        setError(
          response?.response?.data?.message ||
          response?.data?.message ||
          "We couldn't place your order. Please try again."
        );
        return;
      }

      // Store the backend order so the tracking page can read it
      localStorage.setItem("seatflowOrder", JSON.stringify({
        id: order._id,
        items: order.items,
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        token: order.queue?.token || token,
        createdAt: order.createdAt
      }));

      setCart({});
      navigate("/customer/order");
    }
    catch (err) {
      setError(err?.response?.data?.message || "We couldn't place your order. Please try again.");
    }
    finally {
      setPlacing(false);
    }
  }

  return (
    <CustomerLayout active="Cart">
      <h1>Review your order</h1>
      <p className="muted-text">{selectedFoods.reduce((sum, food) => sum + cart[food.id], 0)} items · Party of {customer?.guests || "—"} · Token {customer?.token || "—"}</p>
      {selectedFoods.length === 0 ? (
        <div className="empty-state"><h3>Your cart is empty</h3><Link className="button" to="/customer/menu">Browse menu</Link></div>
      ) : (
        <>
          {selectedFoods.map((food) => (
            <article className="cart-item" key={food.id}>
              <span className="food-emoji food-placeholder"><Utensils size={20} /></span>
              <div className="food-details"><strong>{food.name}</strong><p>{money(food.price)} each</p><div className="quantity-control"><button onClick={() => changeQuantity(food.id, -1)}><Minus size={12} /></button>{cart[food.id]}<button onClick={() => changeQuantity(food.id, 1)} disabled={food.available === false}><Plus size={12} /></button></div></div>
              <strong>{money(food.price * cart[food.id])}</strong>
            </article>
          ))}
          <div className="info-box"><strong>We’ll cook when you’re seated.</strong><p>Your order stays linked to {customer?.token || "your token"}. The kitchen starts after your table is assigned.</p></div>
          <div className="bill-summary">
            <p><span>Item subtotal</span><strong>{money(subtotal)}</strong></p>
            <p><span>GST (5%)</span><strong>{money(tax)}</strong></p>
            <hr /><p><strong>Total</strong><strong>{money(subtotal + tax)}</strong></p>
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="button full-width" onClick={placeOrder} disabled={placing || customer?.status !== "Seated" && (
            <p className="helper-text centered">
              You can place your order once you are seated.
            </p>
          )}>
            {placing ? "Placing your order…" : <>Place order · {money(subtotal + tax)} →</>}
          </button>
          <p className="helper-text centered">No payment now · Pay at the restaurant after dining</p>
        </>
      )}
    </CustomerLayout>
  );
}
