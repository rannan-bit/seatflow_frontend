import { Link, useNavigate } from "react-router-dom";
import { Plus, Minus } from "lucide-react";
import CustomerLayout from "../../components/CustomerLayout.jsx";
import { money } from "../../data/initialData.js";

export default function Cart({ foods, cart, setCart }) {
  const navigate = useNavigate();
  const selectedFoods = foods.filter((food) => cart[food.id] > 0);
  const subtotal = selectedFoods.reduce((sum, food) => sum + food.price * cart[food.id], 0);
  const tax = subtotal * 0.05;

  function changeQuantity(id, amount) {
    setCart((current) => ({ ...current, [id]: Math.max(0, (current[id] || 0) + amount) }));
  }

  function placeOrder() {
    localStorage.setItem("seatflowOrder", JSON.stringify({
      items: selectedFoods.map((food) => ({ ...food, quantity: cart[food.id] })),
      total: subtotal + tax
    }));
    setCart({});
    navigate("/customer/order");
  }

  return (
    <CustomerLayout active="Cart">
      <h1>Review your order</h1>
      <p className="muted-text">{selectedFoods.reduce((sum, food) => sum + cart[food.id], 0)} items · Party of 4 · Token A-024</p>
      {selectedFoods.length === 0 ? (
        <div className="empty-state"><h3>Your cart is empty</h3><Link className="button" to="/customer/menu">Browse menu</Link></div>
      ) : (
        <>
          {selectedFoods.map((food) => (
            <article className="cart-item" key={food.id}>
              <span className="food-emoji">{food.emoji}</span>
              <div className="food-details"><strong>{food.name}</strong><p>{money(food.price)} each</p><div className="quantity-control"><button onClick={() => changeQuantity(food.id, -1)}><Minus size={12} /></button>{cart[food.id]}<button onClick={() => changeQuantity(food.id, 1)}><Plus size={12} /></button></div></div>
              <strong>{money(food.price * cart[food.id])}</strong>
            </article>
          ))}
          <div className="info-box"><strong>We’ll cook when you’re seated.</strong><p>Your order stays linked to A-024. The kitchen starts after your table is assigned.</p></div>
          <div className="bill-summary">
            <p><span>Item subtotal</span><strong>{money(subtotal)}</strong></p>
            <p><span>GST (5%)</span><strong>{money(tax)}</strong></p>
            <hr /><p><strong>Total</strong><strong>{money(subtotal + tax)}</strong></p>
          </div>
          <button className="button full-width" onClick={placeOrder}>Place order · {money(subtotal + tax)} →</button>
          <p className="helper-text centered">No payment now · Pay at the restaurant after dining</p>
        </>
      )}
    </CustomerLayout>
  );
}