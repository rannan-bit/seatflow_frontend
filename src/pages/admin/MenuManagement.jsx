import { useState } from "react";
import { Trash2 } from "lucide-react";
import AdminLayout from "../../components/AdminLayout.jsx";
import { money } from "../../data/initialData.js";

export default function MenuManagement({ foods, setFoods }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  function addFood() {
    if (!name.trim() || Number(price) <= 0) return;
    setFoods((items) => [...items, { id: Date.now(), name, description: "Freshly prepared", price: Number(price), category: "Mains", emoji: "🍽️" }]);
    setName(""); setPrice("");
  }

  return (
    <AdminLayout role="Admin" title="Menu management">
      <h1>Menu management</h1><p className="muted-text">Update dishes, prices and availability.</p>
      <section className="panel form-row">
        <input placeholder="Dish name" value={name} onChange={(event) => setName(event.target.value)} />
        <input placeholder="Price ₹" type="number" value={price} onChange={(event) => setPrice(event.target.value)} />
        <button className="button" onClick={addFood}>+ Add dish</button>
      </section>
      <section className="panel section-gap"><div className="table-scroll"><table>
        <thead><tr><th>DISH</th><th>CATEGORY</th><th>PRICE</th><th>ACTION</th></tr></thead>
        <tbody>{foods.map((food) => <tr key={food.id}><td>{food.emoji} {food.name}<small>{food.description}</small></td><td>{food.category}</td><td>{money(food.price)}</td><td><button className="remove-button" onClick={() => setFoods((items) => items.filter((item) => item.id !== food.id))}><Trash2 size={14} /> Remove</button></td></tr>)}</tbody>
      </table></div></section>
    </AdminLayout>
  );
}