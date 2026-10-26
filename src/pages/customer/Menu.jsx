import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Minus } from "lucide-react";
import CustomerLayout from "../../components/CustomerLayout.jsx";
import { money } from "../../data/initialData.js";

const categories = ["Popular", "Starters", "Mains", "Drinks"];

export default function Menu({ foods, cart, setCart }) {
  const [category, setCategory] = useState("Popular");
  const [search, setSearch] = useState("");
  const visibleFoods = foods.filter((food) =>
    (category === "Popular" || food.category === category) &&
    food.name.toLowerCase().includes(search.toLowerCase())
  );
  const cartTotal = foods.reduce((sum, food) => sum + food.price * (cart[food.id] || 0), 0);

  function changeQuantity(foodId, amount) {
    setCart((current) => ({ ...current, [foodId]: Math.max(0, (current[foodId] || 0) + amount) }));
  }

  return (
    <CustomerLayout active="Menu">
      <h1>Good food starts here.</h1>
      <p className="muted-text">A-024 · Waiting for a table · Party of 4</p>
      <div className="search-box"><Search size={15} /><input placeholder="Search dishes, ingredients…" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
      <div className="category-chips">
        {categories.map((item) => <button key={item} className={category === item ? "selected" : ""} onClick={() => setCategory(item)}>{item}</button>)}
      </div>
      <div className="section-heading"><strong>House favourites</strong><small>● Vegetarian</small></div>
      {visibleFoods.map((food) => (
        <article className="food-card" key={food.id}>
          <span className="food-emoji">{food.emoji}</span>
          <div className="food-details">
            <strong>{food.name}</strong><p>{food.description}</p><b>{money(food.price)}</b>
          </div>
          {(cart[food.id] || 0) > 0 ? (
            <div className="quantity-control">
              <button onClick={() => changeQuantity(food.id, -1)}><Minus size={12} /></button>
              {cart[food.id]}
              <button onClick={() => changeQuantity(food.id, 1)}><Plus size={12} /></button>
            </div>
          ) : <button className="add-button" onClick={() => changeQuantity(food.id, 1)}>Add +</button>}
        </article>
      ))}
      {cartTotal > 0 && <Link className="button full-width menu-cart-button" to="/customer/cart">View cart · {money(cartTotal)} →</Link>}
    </CustomerLayout>
  );
}